function checkMissionTriggers() {
    if (game.currentMission) return;

    const now = Date.now();
    if (settings.globalMissionCooldown && (now - game.lastMissionEndTime) < (settings.globalMissionCooldown * 1000)) {
        return;
    }

    if (!settings.eventMissions) return;
    for (const mission of settings.eventMissions) {
        if (game.completedMissions.includes(mission.id)) continue;
        if (game.missionCooldowns[mission.id] && game.missionCooldowns[mission.id] > now) continue;

        const triggers = Array.isArray(mission.trigger) ? mission.trigger : [mission.trigger];
        let allTriggersMet = true;

        for (const trigger of triggers) {
            let triggerMet = false;
            const context = {
                ips: calculateIps(),
                totalIceCreams: game.totalIceCreamsMade,
                totalClicks: game.clicks,
                clickStrength: calculateClickPower(),
            };
            
            const requiredValue = typeof trigger.value === 'string' 
                ? evaluateMissionFormula(trigger.value, context)
                : trigger.value;

            switch (trigger.type) {
                case 'random':
                    triggerMet = Math.random() < trigger.chance;
                    break;
                case 'totalClicks':
                    triggerMet = game.clicks >= requiredValue;
                    break;
                case 'totalIceCreams':
                    triggerMet = game.totalIceCreamsMade >= requiredValue;
                    break;
                case 'ips':
                    triggerMet = calculateIps() >= requiredValue;
                    break;
                case 'clickStrength':
                    triggerMet = calculateClickPower() >= requiredValue;
                    break;
                case 'specificBuildingCount':
                    const building = game.buildings.find(b => b.id === trigger.id);
                    triggerMet = building && building.count >= requiredValue;
                    break;
            }

            if (!triggerMet) {
                allTriggersMet = false;
                break;
            }
        }

        if (allTriggersMet) {
            startMission(mission);
            return;
        }
    }
}


function startMission(mission) {
    game.currentMission = {
        id: mission.id,
        startTime: Date.now(),
        timeLimit: mission.condition.timeLimit,
        startValue: 0,
        missionData: mission,
        goal: 0,
        rewardValue: 0,
    };

    const context = {
        ips: calculateIps(),
        totalIceCreams: game.totalIceCreamsMade,
        totalClicks: game.clicks,
        clickStrength: calculateClickPower(),
    };
    
    for (const building of settings.buildings) {
        const buildingData = game.buildings.find(b => b.id === building.id);
        const count = buildingData ? buildingData.count : 0;
        context[`building_count_${building.id}`] = count;
        context[`building_ips_${building.id}`] = building.baseIps * count;
    }


    const goal = typeof mission.condition.value === 'string'
        ? evaluateMissionFormula(mission.condition.value, context)
        : mission.condition.value;
    game.currentMission.goal = Math.ceil(goal);

    context.goal = game.currentMission.goal;

    const rewardValue = typeof mission.reward.value === 'string'
        ? evaluateMissionFormula(mission.reward.value, context)
        : mission.reward.value;
    game.currentMission.rewardValue = Math.ceil(rewardValue);

    switch (mission.condition.type) {
        case 'earnIce':
            game.currentMission.startValue = game.totalIceCreamsMade;
            break;
        case 'clickCount':
            game.currentMission.startValue = game.clicks;
            break;
    }

    missionNameEl.textContent = mission.name;
    let description = mission.description.replace('{goal}', formatNumber(game.currentMission.goal));
    description = description.replace('{reward}', formatNumber(game.currentMission.rewardValue));
    missionDescriptionEl.innerHTML = description;
    eventMissionPanel.classList.remove('hidden');
    updateMissionUI();
}

function updateMission() {
    if (!game.currentMission) return;

    const mission = game.currentMission;
    const data = mission.missionData;
    const elapsedTime = (Date.now() - mission.startTime) / 1000;

    if (elapsedTime >= mission.timeLimit) {
        endMission(false);
        return;
    }

    let currentProgress = 0;
    switch (data.condition.type) {
        case 'earnIce':
            currentProgress = game.totalIceCreamsMade - mission.startValue;
            break;
        case 'clickCount':
            currentProgress = game.clicks - mission.startValue;
            break;
    }

    if (currentProgress >= mission.goal) {
        endMission(true);
        return;
    }

    updateMissionUI(currentProgress);
}

function updateMissionUI(currentProgress) {
    if (!game.currentMission) return;
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
    
    const progress = Math.min(100, (progressValue / mission.goal) * 100);
    
    missionProgressBar.style.width = `${progress}%`;
    missionProgressTextEl.textContent = `${formatNumber(Math.floor(progressValue))} / ${formatNumber(mission.goal)}`;
    
    const minutes = Math.floor(remainingTime / 60).toString().padStart(2, '0');
    const seconds = Math.floor(remainingTime % 60).toString().padStart(2, '0');
    missionTimerEl.textContent = `${minutes}:${seconds}`;
}

function endMission(isSuccess) {
    if (!game.currentMission) return;

    const mission = game.currentMission;
    const data = mission.missionData;

    const rewardText = isSuccess ? getRewardText(data.reward) : '';
    showMissionResultPopup(isSuccess, data.name, rewardText);

    if (isSuccess) {
        giveReward(data.reward);
        if (data.trigger.type !== 'random') {
            game.completedMissions.push(mission.id);
        }
    }
    
    if (data.trigger.cooldown) {
        game.missionCooldowns[mission.id] = Date.now() + (data.trigger.cooldown * 1000);
    }

    game.lastMissionEndTime = Date.now();
    game.currentMission = null;
    eventMissionPanel.classList.add('hidden');
}

function getRewardText(reward) {
    if (!reward) return '';
    const rewardValue = game.currentMission.rewardValue;

    switch (reward.type) {
        case 'giveIce':
            return `報酬: アイス ${formatNumber(rewardValue)}個！`;
        case 'buff':
            let effectText = '';
            if (reward.effect === 'clickPower') effectText = 'クリックパワー';
            else if (reward.effect === 'buildingPower' && reward.buildingId) {
                const building = settings.buildings.find(b => b.id === reward.buildingId);
                effectText = `${building.name}の生産性`;
            }
            return `報酬: ${reward.duration}秒間、${effectText}が${reward.multiplier}倍に！`;
        default:
            return '';
    }
}

function giveReward(reward) {
    const rewardValue = game.currentMission.rewardValue;
    switch (reward.type) {
        case 'giveIce':
            game.iceCreams += rewardValue;
            game.totalIceCreamsMade += rewardValue;
            break;
        case 'buff':
            console.log(`Buff activated: ${reward.effect} x${reward.multiplier} for ${reward.duration}s`);
            break;
    }
}

function evaluateMissionFormula(formula, context) {
    try {
        const keys = Object.keys(context);
        const values = Object.values(context);
        const func = new Function(...keys, `return ${formula}`);
        return func(...values);
    } catch (e) {
        console.error(`Error evaluating mission formula "${formula}":`, e);
        return 0;
    }
}

