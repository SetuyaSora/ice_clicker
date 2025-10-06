const formatNumber = (num) => {
    if (isNaN(num) || num === null || num === undefined || num === 0) return '0';
    if (num < 1000) return num.toFixed(1).replace(/\.0$/, '');
    const suffixes = ['', 'K', 'M', 'B', 'T', 'q', 'Q', 's', 'S', 'N', 'd', 'U', 'D', 'Td', 'qd', 'Qd', 'sd', 'Sd'];
    const i = Math.floor(Math.log10(num) / 3);
    if (i >= suffixes.length) return num.toExponential(2);
    const shortNum = (num / Math.pow(1000, i)).toFixed(2);
    return shortNum.replace(/\.00$/, '').replace(/\.([1-9])0$/, '.$1') + suffixes[i];
};

function updateUI() {
    iceCreamCountEl.textContent = formatNumber(Math.floor(game.iceCreams));
    ipsDisplayEl.textContent = formatNumber(calculateIps());
    famePointsEl.textContent = game.famePoints;
    fameBonusEl.textContent = game.famePoints;
    updateBuildingsUI();
    updateUpgradesUI();
}

function updateBuildingsUI() {
    game.buildings.forEach(building => {
        const buildingSettings = settings.buildings.find(b => b.id === building.id);
        if (!buildingSettings) return;

        let buildingEl = document.getElementById(`building-${building.id}`);

        if (building.displayed) {
            // 要素が存在しない場合は新規作成
            if (!buildingEl) {
                buildingEl = document.createElement('div');
                buildingEl.id = `building-${building.id}`;
                buildingEl.innerHTML = `
                    <img src="${buildingSettings.icon}" class="w-12 h-12">
                    <div class="flex-grow">
                        <h3 class="font-bold text-lg">${buildingSettings.name}</h3>
                        <p class="text-sm">コスト: <span class="cost"></span></p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-2xl count">${building.count}</p>
                        <p class="text-xs">${formatNumber(buildingSettings.baseIps)} アイス/秒</p>
                    </div>
                `;
                buildingEl.addEventListener('click', () => buyBuilding(building.id));
                addTooltip(buildingEl, buildingSettings.description);
                buildingsListEl.appendChild(buildingEl);
            }

            // 既存の要素の内容を更新
            const currentCost = Math.ceil(buildingSettings.cost * Math.pow(1.15, building.count));
            const canBuy = Math.floor(game.iceCreams) >= currentCost;

            buildingEl.className = `item-box p-3 rounded-lg flex items-center gap-4 ${canBuy ? 'can-buy' : ''}`;
            buildingEl.querySelector('.cost').textContent = formatNumber(currentCost);
            buildingEl.querySelector('.count').textContent = building.count;

        } else if (buildingEl) {
            // 表示フラグがfalseで、要素がまだ存在する場合は削除
            buildingEl.remove();
        }
    });
}


function updateUpgradesUI() {
    if (!settings.upgrades) return;

    settings.upgrades.forEach(upgrade => {
        const upgradeEl = document.getElementById(`upgrade-${upgrade.id}`);
        const isPurchased = game.upgrades.includes(upgrade.id);

        // 購入済みの場合は要素を削除して終了
        if (isPurchased) {
            if (upgradeEl) upgradeEl.remove();
            return;
        }

        const isPrerequisiteMet = !upgrade.prerequisite || game.upgrades.includes(upgrade.prerequisite);
        let shouldDisplay = true;
        if (upgrade.effects && upgrade.effects.type === 'unlock') {
            const buildingToUnlock = game.buildings.find(b => b.id === upgrade.effects.building);
            if (buildingToUnlock && buildingToUnlock.displayed) {
                shouldDisplay = false;
            }
        }

        // 表示条件を満たさない場合は要素を削除して終了
        if (!isPrerequisiteMet || !shouldDisplay) {
            if (upgradeEl) upgradeEl.remove();
            return;
        }

        // この時点でアップグレードは表示されるべき
        const canBuy = Math.floor(game.iceCreams) >= upgrade.cost;

        if (!upgradeEl) {
            // 要素が存在しない場合は新規作成
            const newUpgradeEl = document.createElement('div');
            newUpgradeEl.id = `upgrade-${upgrade.id}`;
            newUpgradeEl.innerHTML = `
                <img src="${upgrade.icon}" class="w-10 h-10">
                <div class="flex-grow">
                    <h3 class="font-bold">${upgrade.name}</h3>
                    <p class="text-xs">コスト: ${formatNumber(upgrade.cost)}</p>
                </div>
            `;
            newUpgradeEl.addEventListener('click', () => buyUpgrade(upgrade.id));
            addTooltip(newUpgradeEl, upgrade.description);
            
            if (upgrade.effects && upgrade.effects.type === 'unlock') {
                unlockListEl.appendChild(newUpgradeEl);
            } else {
                clickUpgradesListEl.appendChild(newUpgradeEl);
            }
            // クラス名は作成後に追加
            newUpgradeEl.className = `item-box p-2 rounded-lg flex items-center gap-3 ${canBuy ? 'can-buy' : ''}`;
        } else {
            // 既存の要素はクラス名のみ更新
            upgradeEl.className = `item-box p-2 rounded-lg flex items-center gap-3 ${canBuy ? 'can-buy' : ''}`;
        }
    });
}


function addTooltip(element, text) {
    let tooltipVisible = false;
    let lastX = 0;
    let lastY = 0;
    let animationFrameId = null;

    const updateTooltipPosition = () => {
        const tooltipWidth = tooltipEl.offsetWidth;
        const tooltipHeight = tooltipEl.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // 初期位置をカーソルの右下に設定
        let newX = lastX + 15;
        let newY = lastY + 15;

        // 右端にはみ出すかチェック
        if (newX + tooltipWidth > viewportWidth) {
            newX = lastX - tooltipWidth - 15; // はみ出すならカーソルの左に
        }

        // 下端にはみ出すかチェック
        if (newY + tooltipHeight > viewportHeight) {
            newY = lastY - tooltipHeight - 15; // はみ出すならカーソルの上に
        }
        
        // 念のため、左端・上端もチェック
        if (newX < 0) newX = 5;
        if (newY < 0) newY = 5;

        tooltipEl.style.left = `${newX}px`;
        tooltipEl.style.top = `${newY}px`;
        animationFrameId = null;
    };

    element.addEventListener('mouseenter', (e) => {
        tooltipVisible = true;
        tooltipEl.innerHTML = text;
        tooltipEl.classList.remove('hidden');
        lastX = e.pageX;
        lastY = e.pageY;
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(updateTooltipPosition);
        }
    });

    element.addEventListener('mousemove', (e) => {
        lastX = e.pageX;
        lastY = e.pageY;
        if (tooltipVisible && !animationFrameId) {
            animationFrameId = requestAnimationFrame(updateTooltipPosition);
        }
    });

    element.addEventListener('mouseleave', () => {
        tooltipVisible = false;
        tooltipEl.classList.add('hidden');
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    });
}

function createNumberPopup(number, x, y) {
    const popup = document.createElement('div');
    popup.textContent = `+${formatNumber(number)}`;
    popup.className = 'number-popup';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    mainClickerEl.appendChild(popup);
    popup.addEventListener('animationend', () => {
        popup.remove();
    });
}

function showInfoToast(message) {
    toastInfoMessageEl.textContent = message;
    infoToast.classList.remove('translate-y-[200%]');
    setTimeout(() => {
        infoToast.classList.add('translate-y-[200%]');
    }, 3000);
}

function showConfirmation(message, onYes) {
    const messageEl = document.getElementById('confirmation-message');
    const yesBtn = document.getElementById('confirmation-yes');
    const noBtn = document.getElementById('confirmation-no');

    messageEl.textContent = message;

    const yesHandler = () => {
        onYes();
        cleanup();
    };
    const noHandler = () => {
        cleanup();
    };
    const cleanup = () => {
        confirmationModal.classList.add('hidden');
        yesBtn.removeEventListener('click', yesHandler);
        noBtn.removeEventListener('click', noHandler);
    };

    yesBtn.addEventListener('click', yesHandler);
    noBtn.addEventListener('click', noHandler);
    
    confirmationModal.classList.remove('hidden');
}


function showAchievementsPanel() {
    updateAchievementsPanelUI();
    achievementsPanel.classList.remove('hidden');
}

function hideAchievementsPanel() {
    achievementsPanel.classList.add('hidden');
}

/**
 * 実績パネルのUIをグリッド形式で更新します。
 */
function updateAchievementsPanelUI() {
    if (!settings.achievements || !achievementsListEl) return;
    
    const currentView = document.querySelector('.achievement-tab-btn.active').id.includes('main') ? 'main' : 'secret';
    const achievementsToDisplay = settings.achievements.filter(ach => ach.type === currentView);
    
    achievementsListEl.innerHTML = ''; // 既存の要素をクリア

    achievementsToDisplay.forEach(ach => {
        const isUnlocked = game.unlockedAchievements.includes(ach.id);
        const tile = document.createElement('div');
        tile.className = `achievement-tile ${isUnlocked ? 'unlocked' : 'locked'}`;

        let iconHtml = '';
        // アイコンが画像パスか絵文字/テキストかを判定
        const isIconImage = ach.icon && (ach.icon.includes('.png') || ach.icon.includes('.jpg') || ach.icon.includes('.ico'));

        if (isUnlocked) {
            if (isIconImage) {
                iconHtml = `<img src="${ach.icon}" alt="${ach.name}">`;
            } else {
                iconHtml = `<div class="text-icon">${ach.icon}</div>`;
            }
        } else {
            // 未解除の実績
            if (ach.type === 'secret') {
                iconHtml = `<div class="text-icon">❓</div>`;
            } else {
                // 通常の未解除実績は、プレースホルダー画像を表示
                iconHtml = `<img src="images/icecream_vanilla.png" class="locked-icon-placeholder" alt="未解除">`;
            }
        }
        tile.innerHTML = iconHtml;

        // 各タイルにツールチップを設定
        const tooltipHtml = createAchievementTooltipHtml(ach, isUnlocked);
        addTooltip(tile, tooltipHtml);

        achievementsListEl.appendChild(tile);
    });
}

/**
 * 実績タイルに表示するツールチップのHTMLを生成します。
 * @param {object} ach - 実績オブジェクト
 * @param {boolean} isUnlocked - 解除済みかどうか
 * @returns {string} - ツールチップ用のHTML文字列
 */
function createAchievementTooltipHtml(ach, isUnlocked) {
    const difficultyStars = '⭐'.repeat(ach.difficulty);
    let name, description, iconHtml, conditionText;

    const isIconImage = ach.icon && (ach.icon.includes('.png') || ach.icon.includes('.jpg'));

    if (isUnlocked) {
        name = ach.name;
        description = ach.description;
        iconHtml = isIconImage 
            ? `<img src="${ach.icon}" class="w-12 h-12 mr-3 flex-shrink-0">` 
            : `<div class="text-4xl mr-3 flex-shrink-0">${ach.icon}</div>`;
        conditionText = getAchievementConditionText(ach);
    } else {
        name = '？？？';
        if (ach.type === 'secret') {
            description = '達成条件は謎に包まれている…';
            iconHtml = `<div class="text-4xl mr-3 flex-shrink-0">❓</div>`;
            conditionText = '';
        } else { // 通常の未解除実績
            description = ach.description; // ヒントとして説明は表示
            iconHtml = `<img src="images/icecream_vanilla.png" class="w-12 h-12 mr-3 opacity-50 flex-shrink-0">`;
            conditionText = getAchievementConditionText(ach);
        }
    }

    return `
        <div class="flex items-start p-1">
            ${iconHtml}
            <div class="flex-grow">
                <h3 class="font-bold text-lg text-yellow-300">${name}</h3>
                <p class="text-sm text-white">${description}</p>
                ${conditionText ? `<p class="text-xs text-gray-300 mt-2"><b>【条件】</b> ${conditionText}</p>` : ''}
                <div class="flex justify-between items-center mt-2 text-yellow-400 text-sm">
                    <div>${difficultyStars}</div>
                    <div class="font-bold">+${ach.fame || 0} 名声</div>
                </div>
            </div>
        </div>
    `;
}


function getAchievementConditionText(ach) {
    if (!ach || !ach.condition) return '';
    const c = ach.condition;
    const getBuildingName = (id) => settings.buildings.find(b => b.id === id)?.name || '特定の施設';
    
    switch (c.type) {
        case 'totalIceCreams': return `累計アイス生産数: ${formatNumber(c.value)}個`;
        case 'iceCreams': return `所持アイス: ${formatNumber(c.value)}個`;
        case 'clicks': return `総クリック回数: ${formatNumber(c.value)}回`;
        case 'anyBuildingCount': return `いずれかの施設の所有数: ${formatNumber(c.value)}個`;
        case 'specificBuildingCount': return `${getBuildingName(c.id)}の所有数: ${formatNumber(c.value)}個`;
        case 'totalBuildings': return `全施設の合計所有数: ${formatNumber(c.value)}個`;
        case 'allBuildingsCount': return `全ての施設を ${formatNumber(c.value)} 個以上所有`;
        case 'ips': return `秒間アイス生産数(Ips): ${formatNumber(c.value)}`;
        case 'upgradesPurchased': return `購入したアップグレード数: ${formatNumber(c.value)}個`;
        case 'allUpgrades': return '全てのアップグレードを購入';
        case 'clickStrength': return `クリックパワー: ${formatNumber(c.value)}`;
        case 'debug': return '隠されたコマンドを見つける';
        default: return ach.description;
    }
}


function showSecretAchievementTab() {
    document.getElementById('toggle-secret-achievements-btn').classList.remove('hidden');
}

function setAchievementView(view) {
    const mainBtn = document.getElementById('toggle-main-achievements-btn');
    const secretBtn = document.getElementById('toggle-secret-achievements-btn');

    if (view === 'main') {
        mainBtn.classList.add('active');
        secretBtn.classList.remove('active');
    } else {
        mainBtn.classList.remove('active');
        secretBtn.classList.add('active');
    }
    updateAchievementsPanelUI();
}

function showAchievementToast(name) {
    toastAchievementNameEl.textContent = name;
    achievementToast.classList.remove('translate-y-[200%]');
    setTimeout(() => {
        achievementToast.classList.add('translate-y-[200%]');
    }, 3000);
}

function openSaveLoadModal(mode) {
    const titleEl = document.getElementById('save-load-title');
    const containerEl = document.getElementById('save-slots-container');
    
    titleEl.textContent = mode === 'save' ? 'セーブ' : 'ロード';
    containerEl.innerHTML = '';

    for (let i = 1; i <= 3; i++) {
        const slotData = getSaveData(i);
        const slotEl = document.createElement('div');
        slotEl.className = 'p-3 rounded-lg flex items-center gap-4 border-2 border-yellow-400 bg-yellow-50';

        let content;
        if (slotData) {
            const date = new Date(slotData.timestamp || Date.now()).toLocaleString();
            content = `
                <div class="flex-grow">
                    <h3 class="font-bold text-lg">スロット ${i}</h3>
                    <p class="text-sm">アイス: ${formatNumber(Math.floor(slotData.iceCreams))}</p>
                    <p class="text-xs text-gray-500">最終セーブ: ${date}</p>
                </div>
                <div class="space-x-2 flex-shrink-0">
                    <button class="px-3 py-1 bg-yellow-400 rounded shadow clickable export-btn" data-slot="${i}">書き出し</button>
                    <button class="px-3 py-1 ${mode === 'save' ? 'bg-blue-500' : 'bg-green-500'} text-white rounded shadow clickable action-btn" data-slot="${i}">${mode === 'save' ? 'セーブ' : 'ロード'}</button>
                </div>
            `;
        } else {
            content = `
                <div class="flex-grow">
                    <h3 class="font-bold text-lg">スロット ${i}</h3>
                    <p class="text-sm">空のデータ</p>
                </div>
                <div class="space-x-2 flex-shrink-0">
                     <button class="px-3 py-1 ${mode === 'save' ? 'bg-blue-500' : 'bg-gray-400'} text-white rounded shadow clickable action-btn" data-slot="${i}" ${mode === 'load' ? 'disabled' : ''}>${mode === 'save' ? 'セーブ' : 'ロード'}</button>
                </div>
            `;
        }
        slotEl.innerHTML = content;
        containerEl.appendChild(slotEl);
    }

    containerEl.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const slot = e.target.dataset.slot;
            if (mode === 'save') {
                const existingData = getSaveData(slot);
                if (existingData) {
                    showConfirmation(`スロット${slot}のデータを上書きしますか？`, () => {
                        saveGameBySlot(slot);
                        openSaveLoadModal('save');
                        showInfoToast(`スロット${slot}にセーブしました。`);
                    });
                } else {
                    saveGameBySlot(slot);
                    openSaveLoadModal('save');
                    showInfoToast(`スロット${slot}にセーブしました。`);
                }
            } else {
                if (getSaveData(slot)) {
                    showConfirmation(`スロット${slot}のデータをロードしますか？`, () => {
                        loadGameBySlot(slot);
                        saveGameBySlot(AUTOSAVE_SLOT);
                        showInfoToast(`ロードが完了しました。ページが再読み込みされます。`);
                        setTimeout(() => window.location.reload(), 1500);
                    });
                }
            }
        });
    });
    
    containerEl.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const slot = e.target.dataset.slot;
            const data = getSaveData(slot);
            if (data) {
                const exportString = btoa(JSON.stringify(data));
                document.getElementById('export-textarea').value = exportString;
                exportModal.classList.remove('hidden');
            }
        });
    });

    saveLoadModal.classList.remove('hidden');
}

function openImportModal() {
    const containerEl = document.getElementById('import-slots-container');
    containerEl.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
        containerEl.innerHTML += `
            <label class="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 border-2 border-yellow-400">
                <input type="radio" name="import-slot" value="${i}" class="form-radio h-5 w-5 text-yellow-500">
                <span class="font-bold">スロット ${i}</span>
            </label>
        `;
    }
    importModal.classList.remove('hidden');
}

function setupSaveLoadEventListeners() {
    saveBtn.addEventListener('click', () => openSaveLoadModal('save'));
    loadBtn.addEventListener('click', () => openSaveLoadModal('load'));
    importBtn.addEventListener('click', () => openImportModal());

    closeSaveLoadModalBtn.addEventListener('click', () => saveLoadModal.classList.add('hidden'));

    const closeExportBtn = document.getElementById('close-export-modal');
    closeExportBtn.addEventListener('click', () => exportModal.classList.add('hidden'));
    
    const copyExportBtn = document.getElementById('copy-export-data');
    copyExportBtn.addEventListener('click', () => {
        document.getElementById('export-textarea').select();
        document.execCommand('copy');
        showInfoToast("コピーしました！");
    });
    
    const closeImportBtn = document.getElementById('close-import-modal');
    closeImportBtn.addEventListener('click', () => importModal.classList.add('hidden'));
    
    const importDataBtn = document.getElementById('import-data-btn');
    importDataBtn.addEventListener('click', () => {
        const data = document.getElementById('import-textarea').value;
        const selectedSlotInput = document.querySelector('input[name="import-slot"]:checked');

        if (!selectedSlotInput) {
            showInfoToast("インポート先のスロットを選択してください。");
            return;
        }
        const slot = selectedSlotInput.value;

        try {
            const parsedData = JSON.parse(atob(data));
            if (parsedData && typeof parsedData.iceCreams === 'number') {
                const existingData = getSaveData(slot);
                const message = existingData 
                    ? `スロット${slot}のデータを上書きします。よろしいですか？`
                    : `空のスロット${slot}にデータをインポートします。よろしいですか？`;
                
                showConfirmation(message, () => {
                    localStorage.setItem(SAVE_KEY_PREFIX + slot, JSON.stringify(parsedData));
                    showInfoToast(`スロット${slot}にデータをインポートしました。`);
                    importModal.classList.add('hidden');
                });

            } else {
                throw new Error("Invalid save data.");
            }
        } catch (e) {
            showInfoToast("無効なセーブデータです。");
            console.error("Import failed:", e);
        }
    });
}

