let settings = {};
let game = {
    iceCreams: 0,
    totalIceCreamsMade: 0,
    clicks: 0,
    buildings: [],
    upgrades: [],
    unlockedAchievements: [],
    famePoints: 0,
    debugMenuOpened: false,
    secretTabUnlocked: false,
    currentMission: null,
    pendingMissions: [], // Missions waiting on the board
    completedMissions: [],
    missionCooldowns: {},
    activeBuffs: [],
    lastMissionEndTime: 0,
    lastClickTimestamp: Date.now(),
    iceCreamAtLastClick: 0,
};

// UI要素の定数宣言は ui-elements.js に移動しました

function executeDebugCommand(command) {
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
        case 'getice':
            const amount = parseInt(args[0], 10);
            if (!isNaN(amount)) {
                game.iceCreams += amount;
                showInfoToast(`アイスを ${formatNumber(amount)} 個入手しました。`);
            } else {
                showInfoToast("無効な数値です。");
            }
            return true;
        case 'unlockach':
            const achId = args[0];
            if (achId) {
                const achievement = settings.achievements.find(a => a.id === achId);
                if (achievement && !game.unlockedAchievements.includes(achId)) {
                    unlockAchievement(achId, true); // trueで強制解除
                } else if (!achievement) {
                    showInfoToast(`実績ID「${achId}」が見つかりません。`);
                } else {
                    showInfoToast("その実績は既に解除済みです。");
                }
            } else {
                showInfoToast("実績IDを指定してください。");
            }
            return true;

        case 'addmission':
            const missionId = args[0];
            if (!missionId) {
                showInfoToast("ミッションIDを指定してください。");
                return true;
            }
            const missionToAdd = settings.eventMissions.find(m => m.id === missionId);
            if (missionToAdd) {
                if (game.pendingMissions.length >= settings.missionBoardCapacity) {
                    showInfoToast("ミッションボードが満杯です。");
                } else if (game.pendingMissions.some(p => p.id === missionId)) {
                    showInfoToast("そのミッションは既にボードにあります。");
                } else {
                    addPendingMission(missionToAdd);
                    updateMissionBoardUI(); // ★ UI更新をここに追加
                    showInfoToast(`ミッション「${missionToAdd.name}」をボードに追加しました。`);
                }
            } else {
                showInfoToast(`ミッションID「${missionId}」が見つかりません。`);
            }
            return true;
        
        case 'reset':
            showConfirmation('本当にすべてのセーブデータをリセットしますか？この操作は取り消せません。', () => {
                resetGame(); // save.js のリセット関数を呼び出す
            });
            // 確認モーダルが表示されるので、デバッグウィンドウは閉じさせない
            return true; 
        
        default:
            showInfoToast("不明なコマンドです。");
            return true;
    }
}


document.addEventListener('DOMContentLoaded', init);

function init() {
    try {
        settings.mainClicker = gameSettings.mainClicker;
        settings.buildings = gameSettings.buildings;
        settings.upgrades = gameSettings.upgrades;
        settings.achievements = [...gameMainAchievements, ...gameSecretAchievements];
        settings.eventMissions = gameEventMissions;
        settings.globalMissionCooldown = gameSettings.globalMissionCooldown;
        settings.missionBoardCapacity = 3; // Max missions on board

        const wasLoaded = loadInitialData();

        if (!wasLoaded || game.buildings.length === 0) {
            game.buildings = settings.buildings.map(b => ({
                id: b.id,
                count: 0,
                displayed: b.id === 'grandpa'
            }));
        } 
        else {
            settings.buildings.forEach(settingBuilding => {
                const existsInGame = game.buildings.some(gameBuilding => gameBuilding.id === settingBuilding.id);
                if (!existsInGame) {
                    game.buildings.push({
                        id: settingBuilding.id,
                        count: 0,
                        displayed: false
                    });
                }
            });
             if (!game.lastClickTimestamp) game.lastClickTimestamp = Date.now();
             if (!game.iceCreamAtLastClick) game.iceCreamAtLastClick = 0;
        }

        const mainClickerImg = mainClickerEl.querySelector('img');
        if (mainClickerImg) mainClickerImg.src = settings.mainClicker.image;
        if (settings.mainClicker.backgroundColor) {
            mainClickerEl.style.backgroundColor = settings.mainClicker.backgroundColor;
        }

        if (game.secretTabUnlocked) {
            showSecretAchievementTab();
        }

        setupEventListeners();
        updateUI();
        updateAchievementsPanelUI();
        updateMissionBoardUI();

        setInterval(gameLoop, 100);
        setInterval(autoSave, 5000);

    } catch (e) {
        console.error("Error initializing game:", e);
        alert("ゲームの初期化に失敗しました。");
    }
}

function gameLoop() {
    // 1. このフレームで生産されるアイスの量を計算
    const ips = calculateIps();
    const fameBonus = 1 + (game.famePoints / 100);
    const iceCreamsToAdd = (ips * fameBonus) / 10;
    const previousPendingMissionsCount = game.pendingMissions.length;

    // 2. ゲームの状態を更新
    game.iceCreams += iceCreamsToAdd;
    game.totalIceCreamsMade += iceCreamsToAdd;
    
    // 3. 更新された状態でミッションの発生・進捗をチェック
    checkMissionTriggers();
    updateMission();
    
    // 4. UIの更新と実績のチェック
    updateUI();
    checkAchievements();

    // ★ ミッションボードに変化があったらUIを更新
    if (game.pendingMissions.length !== previousPendingMissionsCount) {
        updateMissionBoardUI();
    }
}

function setupEventListeners() {
    mainClickerEl.addEventListener('click', (e) => {
        const clickPower = calculateClickPower();
        game.iceCreams += clickPower;
        game.totalIceCreamsMade += clickPower;
        game.clicks++;
        game.lastClickTimestamp = Date.now();
        game.iceCreamAtLastClick = game.totalIceCreamsMade;


        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createNumberPopup(clickPower, x, y);

        if (game.currentMission && game.currentMission.missionData.condition.type === 'clickCount') {
            updateMissionUI();
        }
        
        checkEventAchievement('exactClickCount', { clicks: game.clicks });
        updateUI();
    });

    showAchievementsBtn.addEventListener('click', () => {
        checkEventAchievement('openAchievementPanel');
        showAchievementsPanel();
    });
    closeAchievementsBtn.addEventListener('click', () => hideAchievementsPanel());
    
    const toggleMainBtn = document.getElementById('toggle-main-achievements-btn');
    const toggleSecretBtn = document.getElementById('toggle-secret-achievements-btn');
    toggleMainBtn.addEventListener('click', () => setAchievementView('main'));
    toggleSecretBtn.addEventListener('click', () => setAchievementView('secret'));

    // Mission Board Listeners
    missionBoardToggleEl.addEventListener('click', () => showMissionBoard());
    closeMissionBoardBtn.addEventListener('click', () => hideMissionBoard());

    setupSaveLoadEventListeners();

    let keySequence = '';
    const secretCode = 'cream';
    window.addEventListener('keyup', (e) => {
        if (e.key.length === 1 && !debugModalEl.classList.contains('hidden')) return;
        if (e.key.length === 1) {
            keySequence += e.key;
            if (keySequence.length > secretCode.length) {
                keySequence = keySequence.slice(1);
            }
            if (keySequence.toLowerCase() === secretCode) {
                setTimeout(() => {
                    debugModalEl.classList.remove('hidden');
                    debugInputEl.focus();
                }, 0);
                
                keySequence = '';
                if (!game.debugMenuOpened) {
                    game.debugMenuOpened = true;
                    checkAchievements();
                }
            }
        }
    });

    debugCancelBtn.addEventListener('click', () => {
        debugModalEl.classList.add('hidden');
        debugInputEl.value = '';
        keySequence = '';
    });

    debugExecuteBtn.addEventListener('click', () => {
        const command = debugInputEl.value;
        let handledOwnUI = false;
        if (command) {
            handledOwnUI = executeDebugCommand(command.toLowerCase().trim());
        }
        
        if (!handledOwnUI) {
            debugModalEl.classList.add('hidden');
            debugInputEl.value = '';
            keySequence = '';
        }
    });

    debugInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            debugExecuteBtn.click();
        }
    });
}

