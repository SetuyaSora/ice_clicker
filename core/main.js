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
    completedMissions: [],
    missionCooldowns: {},
    activeBuffs: [],
    lastMissionEndTime: 0,
};

const iceCreamCountEl = document.getElementById('ice-cream-count');
const ipsDisplayEl = document.getElementById('ips-display');
const mainClickerEl = document.getElementById('main-clicker');
const buildingsListEl = document.getElementById('buildings-list');
const clickUpgradesListEl = document.getElementById('click-upgrades-list');
const unlockListEl = document.getElementById('unlock-list');
const famePointsEl = document.getElementById('fame-points');
const fameBonusEl = document.getElementById('fame-bonus');
const tooltipEl = document.getElementById('tooltip');
const showAchievementsBtn = document.getElementById('show-achievements-btn');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const importBtn = document.getElementById('import-btn');
const achievementsPanel = document.getElementById('achievements-panel');
const closeAchievementsBtn = document.getElementById('close-achievements-btn');
const achievementsListEl = document.getElementById('achievements-list');
const saveLoadModal = document.getElementById('save-load-modal');
const closeSaveLoadModalBtn = document.getElementById('close-save-load-modal');
const confirmationModal = document.getElementById('confirmation-modal');
const exportModal = document.getElementById('export-modal');
const importModal = document.getElementById('import-modal');
const achievementToast = document.getElementById('achievement-toast');
const toastAchievementNameEl = document.getElementById('toast-achievement-name');
const infoToast = document.getElementById('info-toast');
const toastInfoMessageEl = document.getElementById('toast-info-message');
const debugModalEl = document.getElementById('debug-modal');
const debugInputEl = document.getElementById('debug-input');
const debugCancelBtn = document.getElementById('debug-cancel');
const debugExecuteBtn = document.getElementById('debug-execute');
const eventMissionPanel = document.getElementById('event-mission-panel');
const missionNameEl = document.getElementById('mission-name');
const missionDescriptionEl = document.getElementById('mission-description');
const missionProgressBar = document.getElementById('mission-progress-bar');
const missionProgressTextEl = document.getElementById('mission-progress-text');
const missionTimerEl = document.getElementById('mission-timer');
const missionResultPopupEl = document.getElementById('mission-result-popup');
const missionResultContentEl = document.getElementById('mission-result-content');
const missionResultTitleEl = document.getElementById('mission-result-title');
const missionResultMessageEl = document.getElementById('mission-result-message');


document.addEventListener('DOMContentLoaded', init);

function init() {
    try {
        settings.mainClicker = gameSettings.mainClicker;
        settings.buildings = gameSettings.buildings;
        settings.upgrades = gameSettings.upgrades;
        settings.achievements = gameAchievements;
        settings.eventMissions = gameEventMissions;
        settings.globalMissionCooldown = gameSettings.globalMissionCooldown;

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

        setInterval(gameLoop, 100);
        setInterval(autoSave, 5000);

    } catch (e) {
        console.error("Error initializing game:", e);
        alert("ゲームの初期化に失敗しました。");
    }
}

function gameLoop() {
    checkMissionTriggers();
    updateMission();

    const ips = calculateIps();
    const fameBonus = 1 + (game.famePoints / 100);
    const iceCreamsToAdd = (ips * fameBonus) / 10;

    game.iceCreams += iceCreamsToAdd;
    game.totalIceCreamsMade += iceCreamsToAdd;

    iceCreamCountEl.textContent = formatNumber(Math.floor(game.iceCreams));
    ipsDisplayEl.textContent = formatNumber(ips);

    checkAchievements();
}

function setupEventListeners() {
    mainClickerEl.addEventListener('click', (e) => {
        const clickPower = calculateClickPower();
        game.iceCreams += clickPower;
        game.totalIceCreamsMade += clickPower;
        game.clicks++;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createNumberPopup(clickPower, x, y);

        if (game.currentMission && game.currentMission.missionData.condition.type === 'clickCount') {
            updateMissionUI();
        }
        checkAchievements();
        updateUI();
    });

    showAchievementsBtn.addEventListener('click', () => showAchievementsPanel());
    closeAchievementsBtn.addEventListener('click', () => hideAchievementsPanel());
    
    const toggleMainBtn = document.getElementById('toggle-main-achievements-btn');
    const toggleSecretBtn = document.getElementById('toggle-secret-achievements-btn');
    toggleMainBtn.addEventListener('click', () => setAchievementView('main'));
    toggleSecretBtn.addEventListener('click', () => setAchievementView('secret'));

    setupSaveLoadEventListeners();

    let keySequence = '';
    const secretCode = 'cream';
    window.addEventListener('keyup', (e) => {
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
                game.debugMenuOpened = true;
                checkAchievements();
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

