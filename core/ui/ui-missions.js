/**
 * 報酬オブジェクトから、UI表示用のテキストを生成します。
 * @param {object} reward - ミッションの報酬オブジェクト
 * @param {number} rewardValue - 計算済みの報酬量
 * @returns {string} 表示用の報酬テキスト
 */
function getRewardText(reward, rewardValue) {
    if (!reward || rewardValue === undefined) return '';

    switch (reward.type) {
        case 'giveIce':
            return `アイス ${formatNumber(rewardValue)}個`;
        case 'buff':
            let effectText = '';
            if (reward.effect === 'clickPower') {
                effectText = 'クリックパワー';
            } else if (reward.effect === 'buildingPower' && reward.buildingId) {
                const building = settings.buildings.find(b => b.id === reward.buildingId);
                effectText = `${building ? building.name : '施設'}の生産性`;
            }
            return `${reward.duration}秒間、${effectText}が${reward.multiplier}倍`;
        default:
            return '';
    }
}

/**
 * 遂行中のミッションのUI（プログレスバー、タイマーなど）を更新します。
 * @param {number} [currentProgress] - 現在のミッション進捗。指定されない場合は内部で再計算されます。
 */
function updateMissionUI(currentProgress) {
    if (!game.currentMission) {
        if (!eventMissionPanel.classList.contains('hidden')) {
            eventMissionPanel.classList.add('hidden');
        }
        return;
    }

    if (eventMissionPanel.classList.contains('hidden')) {
        eventMissionPanel.classList.remove('hidden');
    }

    const mission = game.currentMission;
    const data = mission.missionData;
    const elapsedTime = (Date.now() - mission.startTime) / 1000;
    const remainingTime = Math.max(0, mission.timeLimit - elapsedTime);

    let progressValue = currentProgress;
    if (progressValue === undefined) {
         switch (data.condition.type) {
            case 'earnIce':
                progressValue = game.totalIceCreamsMade - mission.startValue;
                break;
            case 'clickCount':
                progressValue = game.clicks - mission.startValue;
                break;
            default:
                progressValue = 0;
        }
    }
    
    const progressPercent = Math.min(100, (progressValue / mission.goal) * 100);
    
    missionProgressBar.style.width = `${progressPercent}%`;
    missionProgressTextEl.textContent = `${formatNumber(Math.floor(progressValue))} / ${formatNumber(mission.goal)}`;
    
    const minutes = Math.floor(remainingTime / 60).toString().padStart(2, '0');
    const seconds = Math.floor(remainingTime % 60).toString().padStart(2, '0');
    missionTimerEl.textContent = `${minutes}:${seconds}`;

    if (missionNameEl.textContent !== data.name) {
        missionNameEl.textContent = data.name;
        let description = data.description.replace('{goal}', formatNumber(mission.goal));
        const rewardText = getRewardText(data.reward, mission.rewardValue);
        description = description.replace('{reward}', rewardText);
        missionDescriptionEl.innerHTML = description;
    }
}

/**
 * ミッションボードのパネルを表示します。
 */
function showMissionBoard() {
    const missionBoardPanelEl = document.getElementById('mission-board-panel');
    missionBoardPanelEl.classList.add('open');
}

/**
 * ミッションボードのパネルを非表示にします。
 */
function hideMissionBoard() {
    const missionBoardPanelEl = document.getElementById('mission-board-panel');
    missionBoardPanelEl.classList.remove('open');
}

/**
 * ミッションボードのUIを更新します。
 */
function updateMissionBoardUI() {
    const missionBoardListEl = document.getElementById('mission-board-list');
    const notificationEl = document.getElementById('mission-board-notification');

    missionBoardListEl.innerHTML = ''; // Clear existing list

    if (game.pendingMissions.length === 0) {
        missionBoardListEl.innerHTML = `<p class="text-center text-gray-500 mt-4">新しい依頼はありません。</p>`;
        notificationEl.classList.add('hidden');
        return;
    }

    notificationEl.classList.remove('hidden');
    notificationEl.textContent = game.pendingMissions.length;

    game.pendingMissions.forEach(mission => {
        const card = document.createElement('div');
        card.className = 'mission-card';

        let rewardIcon = '🎁';
        if(mission.reward.type === 'giveIce') rewardIcon = '🍦';
        if(mission.reward.type === 'buff') rewardIcon = '✨';

        const difficulty = '⭐<span class="text-gray-300">☆☆</span>'; 

        card.innerHTML = `
            <h3 class="font-bold text-lg">${mission.name}</h3>
            <div class="text-sm text-yellow-500 mb-2">${difficulty}</div>
            <p class="text-sm mb-3">${mission.description.split('<br>')[0]}</p>
            <div class="text-center font-bold text-green-600 mb-4">主な報酬: ${rewardIcon}</div>
            <div class="flex justify-between gap-2">
                <button class="w-1/2 px-3 py-1 bg-red-500 text-white text-sm rounded shadow clickable discard-btn" data-id="${mission.id}">破棄する</button>
                <button class="w-1/2 px-3 py-1 bg-green-500 text-white text-sm rounded shadow clickable accept-btn" data-id="${mission.id}">受注する</button>
            </div>
        `;
        missionBoardListEl.appendChild(card);
    });

    missionBoardListEl.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', (e) => acceptMission(e.target.dataset.id));
    });
    missionBoardListEl.querySelectorAll('.discard-btn').forEach(btn => {
        btn.addEventListener('click', (e) => discardMission(e.target.dataset.id));
    });
}
