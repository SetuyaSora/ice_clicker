/**
 * 数値をK, M, Bなどの単位に変換します。
 * @param {number} num - フォーマットする数値
 * @returns {string} フォーマットされた文字列
 */
const formatNumber = (num) => {
    if (isNaN(num) || num === null || num === undefined || num === 0) return '0';
    if (num < 1000) return num.toFixed(1).replace(/\.0$/, '');
    const suffixes = ['', 'K', 'M', 'B', 'T', 'q', 'Q', 's', 'S', 'N', 'd', 'U', 'D', 'Td', 'qd', 'Qd', 'sd', 'Sd'];
    const i = Math.floor(Math.log10(num) / 3);
    if (i >= suffixes.length) return num.toExponential(2);
    const shortNum = (num / Math.pow(1000, i)).toFixed(2);
    return shortNum.replace(/\.00$/, '').replace(/\.([1-9])0$/, '.$1') + suffixes[i];
};

/**
 * メインのUI要素を更新します。
 */
function updateUI() {
    iceCreamCountEl.textContent = formatNumber(Math.floor(game.iceCreams));
    ipsDisplayEl.textContent = formatNumber(calculateIps());
    famePointsEl.textContent = game.famePoints;
    fameBonusEl.textContent = game.famePoints;
    updateBuildingsUI();
    updateUpgradesUI();
}

/**
 * 施設のリスト表示を更新します。
 */
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

/**
 * アップグレードのリスト表示を更新します。
 */
function updateUpgradesUI() {
    if (!settings.upgrades) return;

    settings.upgrades.forEach(upgrade => {
        const upgradeEl = document.getElementById(`upgrade-${upgrade.id}`);
        const isPurchased = game.upgrades.includes(upgrade.id);

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

        if (!isPrerequisiteMet || !shouldDisplay) {
            if (upgradeEl) upgradeEl.remove();
            return;
        }

        const canBuy = Math.floor(game.iceCreams) >= upgrade.cost;

        if (!upgradeEl) {
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
            newUpgradeEl.className = `item-box p-2 rounded-lg flex items-center gap-3 ${canBuy ? 'can-buy' : ''}`;
        } else {
            upgradeEl.className = `item-box p-2 rounded-lg flex items-center gap-3 ${canBuy ? 'can-buy' : ''}`;
        }
    });
}

/**
 * 指定した要素にツールチップ機能を追加します。
 * @param {HTMLElement} element - ツールチップを追加する要素
 * @param {string} text - ツールチップに表示するHTMLテキスト
 */
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

        let newX = lastX + 15;
        let newY = lastY + 15;

        if (newX + tooltipWidth > viewportWidth) newX = lastX - tooltipWidth - 15;
        if (newY + tooltipHeight > viewportHeight) newY = lastY - tooltipHeight - 15;
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

/**
 * クリック時に数字が飛び出すエフェクトを生成します。
 * @param {number} number - 表示する数値
 * @param {number} x - 表示するX座標
 * @param {number} y - 表示するY座標
 */
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
