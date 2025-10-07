/**
 * 実績パネルを表示します。
 */
function showAchievementsPanel() {
    updateAchievementsPanelUI();
    achievementsPanel.classList.remove('hidden');
}

/**
 * 実績パネルを非表示にします。
 */
function hideAchievementsPanel() {
    achievementsPanel.classList.add('hidden');
}

/**
 * 実績パネルのUIをグリッド形式で更新します。
 */
function updateAchievementsPanelUI() {
    if (!settings.achievements || !achievementsListEl) return;
    
    // ---解放率ゲージの計算---
    const mainAchievements = settings.achievements.filter(ach => ach.type === 'main');
    const secretAchievements = settings.achievements.filter(ach => ach.type === 'secret');

    const unlockedMainCount = mainAchievements.filter(ach => game.unlockedAchievements.includes(ach.id)).length;
    const unlockedSecretCount = secretAchievements.filter(ach => game.unlockedAchievements.includes(ach.id)).length;

    const totalMain = mainAchievements.length;
    const totalSecret = secretAchievements.length;

    const mainPercentage = totalMain > 0 ? (unlockedMainCount / totalMain) * 100 : 0;
    const secretPercentage = totalSecret > 0 ? (unlockedSecretCount / totalSecret) * 100 : 0;

    // ---ゲージの表示内容を更新---
    document.getElementById('main-achievement-progress-bar').style.width = `${mainPercentage}%`;
    document.getElementById('main-achievement-progress-text').textContent = `${unlockedMainCount} / ${totalMain} (${mainPercentage.toFixed(1)}%)`;
    document.getElementById('secret-achievement-progress-bar').style.width = `${secretPercentage}%`;
    document.getElementById('secret-achievement-progress-text').textContent = `${unlockedSecretCount} / ${totalSecret} (${secretPercentage.toFixed(1)}%)`;
    
    // ---アクティブなタブに応じて、表示するゲージを切り替える---
    const currentView = document.querySelector('.achievement-tab-btn.active').id.includes('main') ? 'main' : 'secret';
    const mainProgressContainer = document.getElementById('main-achievement-progress-container');
    const secretProgressContainer = document.getElementById('secret-achievement-progress-container');

    if (currentView === 'main') {
        mainProgressContainer.classList.remove('hidden');
        secretProgressContainer.classList.add('hidden');
    } else { // 'secret' view
        mainProgressContainer.classList.add('hidden');
        if (game.secretTabUnlocked) {
            secretProgressContainer.classList.remove('hidden');
        } else {
            secretProgressContainer.classList.add('hidden');
        }
    }
    
    // ---実績タイルの表示更新---
    const achievementsToDisplay = settings.achievements.filter(ach => ach.type === currentView);
    
    achievementsListEl.innerHTML = ''; // 既存の要素をクリア

    achievementsToDisplay.forEach(ach => {
        const isUnlocked = game.unlockedAchievements.includes(ach.id);
        const tile = document.createElement('div');
        tile.className = `achievement-tile ${isUnlocked ? 'unlocked' : 'locked'}`;

        let iconHtml = '';
        const isIconImage = ach.icon && (ach.icon.includes('.png') || ach.icon.includes('.jpg') || ach.icon.includes('.ico'));

        if (isUnlocked) {
            if (isIconImage) {
                iconHtml = `<img src="${ach.icon}" alt="${ach.name}">`;
            } else {
                iconHtml = `<div class="text-icon">${ach.icon}</div>`;
            }
        } else {
            if (ach.type === 'secret') {
                iconHtml = `<div class="text-icon">❓</div>`;
            } else {
                iconHtml = `<img src="images/icecream_vanilla.png" class="locked-icon-placeholder" alt="未解除">`;
            }
        }
        tile.innerHTML = iconHtml;

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
        } else {
            description = ach.description;
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

/**
 * 実績の達成条件から表示用のテキストを生成します。
 * @param {object} ach - 実績オブジェクト
 * @returns {string} 表示用の達成条件テキスト
 */
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

/**
 * 実績パネルに隠し実績タブを表示します。
 */
function showSecretAchievementTab() {
    document.getElementById('toggle-secret-achievements-btn').classList.remove('hidden');
}

/**
 * 実績パネルの表示を通常/隠しで切り替えます。
 * @param {'main' | 'secret'} view - 表示する実績の種類
 */
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
