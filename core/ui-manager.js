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
    buildingsListEl.innerHTML = '';
    game.buildings.forEach(building => {
        if (building.displayed) {
            const buildingSettings = settings.buildings.find(b => b.id === building.id);
            if (!buildingSettings) return;
            const currentCost = Math.ceil(buildingSettings.cost * Math.pow(1.15, building.count));
            const canBuy = Math.floor(game.iceCreams) >= currentCost;
            const buildingEl = document.createElement('div');
            buildingEl.className = `item-box p-3 rounded-lg flex items-center gap-4 ${canBuy ? 'can-buy' : ''}`;
            buildingEl.innerHTML = `
                <img src="${buildingSettings.icon}" class="w-12 h-12">
                <div class="flex-grow">
                    <h3 class="font-bold text-lg">${buildingSettings.name}</h3>
                    <p class="text-sm">コスト: ${formatNumber(currentCost)}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold text-2xl">${building.count}</p>
                    <p class="text-xs">${formatNumber(buildingSettings.baseIps)} アイス/秒</p>
                </div>
            `;
            buildingEl.addEventListener('click', () => buyBuilding(building.id));
            addTooltip(buildingEl, buildingSettings.description);
            buildingsListEl.appendChild(buildingEl);
        }
    });
}

function updateUpgradesUI() {
    clickUpgradesListEl.innerHTML = '';
    unlockListEl.innerHTML = '';
    if (!settings.upgrades) return;
    settings.upgrades.forEach(upgrade => {
        if (!game.upgrades.includes(upgrade.id)) {
            const isPrerequisiteMet = !upgrade.prerequisite || game.upgrades.includes(upgrade.prerequisite);
            if (isPrerequisiteMet) {
                let shouldDisplay = true;
                if (upgrade.effects && upgrade.effects.type === 'unlock') {
                     const buildingToUnlock = game.buildings.find(b => b.id === upgrade.effects.building);
                     if (buildingToUnlock && buildingToUnlock.displayed) {
                         shouldDisplay = false;
                     }
                }

                if(shouldDisplay) {
                    const canBuy = Math.floor(game.iceCreams) >= upgrade.cost;
                    const upgradeEl = document.createElement('div');
                    upgradeEl.className = `item-box p-2 rounded-lg flex items-center gap-3 ${canBuy ? 'can-buy' : ''}`;
                    upgradeEl.innerHTML = `
                        <img src="${upgrade.icon}" class="w-10 h-10">
                        <div class="flex-grow">
                            <h3 class="font-bold">${upgrade.name}</h3>
                            <p class="text-xs">コスト: ${formatNumber(upgrade.cost)}</p>
                        </div>
                    `;
                    upgradeEl.addEventListener('click', () => buyUpgrade(upgrade.id));
                    addTooltip(upgradeEl, upgrade.description);
                    if (upgrade.effects && upgrade.effects.type === 'unlock') {
                        unlockListEl.appendChild(upgradeEl);
                    } else {
                        clickUpgradesListEl.appendChild(upgradeEl);
                    }
                }
            }
        }
    });
}

function addTooltip(element, text) {
    element.addEventListener('mouseenter', () => {
        tooltipEl.innerHTML = text;
        tooltipEl.classList.remove('hidden');
    });
    element.addEventListener('mousemove', (e) => {
        tooltipEl.style.left = `${e.pageX + 10}px`;
        tooltipEl.style.top = `${e.pageY + 10}px`;
    });
    element.addEventListener('mouseleave', () => {
        tooltipEl.classList.add('hidden');
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

function updateAchievementsPanelUI() {
    if (!settings.achievements || !achievementsListEl) return;
    
    const currentView = document.querySelector('.achievement-tab-btn.active').id.includes('main') ? 'main' : 'secret';
    
    const achievementsToDisplay = settings.achievements.filter(ach => ach.type === currentView);
    
    achievementsListEl.innerHTML = '';
    achievementsToDisplay.forEach(ach => {
        const isUnlocked = game.unlockedAchievements.includes(ach.id);
        const el = document.createElement('div');
        el.className = `achievement-item p-3 rounded-lg flex items-center gap-4 ${isUnlocked ? 'unlocked' : ''}`;
        
        let name, description, icon, conditionText;
        const difficultyStars = '⭐'.repeat(ach.difficulty);

        if (isUnlocked) {
            name = ach.name;
            description = ach.description;
            icon = ach.icon;
            conditionText = getAchievementConditionText(ach);
        } else {
            if (ach.type === 'secret') {
                name = '？？？';
                description = '達成条件は謎に包まれている…';
                icon = '❓';
                conditionText = '';
            } else { // main achievement
                name = '？？？';
                description = ach.description;
                icon = ach.icon;
                conditionText = getAchievementConditionText(ach);
            }
        }

        el.innerHTML = `
            <div class="achievement-icon text-4xl">${icon}</div>
            <div class="flex-grow">
                <h3 class="font-bold text-lg">${name}</h3>
                <p class="text-sm">${description}</p>
                ${conditionText ? `<p class="text-xs text-gray-500 mt-1">【条件】 ${conditionText}</p>` : ''}
            </div>
            <div class="text-right">
                <div class="text-yellow-500 font-bold">${difficultyStars}</div>
                <p class="font-bold text-yellow-500">+${ach.fame || 0} 名声</p>
            </div>
        `;
        achievementsListEl.appendChild(el);
    });
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

