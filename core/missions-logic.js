function checkMissionTriggers() {
    // A mission is already active, or the board is full.
    if (game.currentMission || game.pendingMissions.length >= settings.missionBoardCapacity) {
        return;
    }

    const now = Date.now();
    // Global cooldown after a mission ends.
    if (settings.globalMissionCooldown && (now - game.lastMissionEndTime) < (settings.globalMissionCooldown * 1000)) {
        return;
    }

    if (!settings.eventMissions) return;
    for (const mission of settings.eventMissions) {
        // Mission is already completed, on the board, or on cooldown.
        if (game.completedMissions.includes(mission.id) || 
            game.pendingMissions.some(p => p.id === mission.id) ||
            (game.missionCooldowns[mission.id] && game.missionCooldowns[mission.id] > now)) {
            continue;
        }

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
            addPendingMission(mission);
            // Stop checking after finding one mission to add.
            return; 
        }
    }
}

function addPendingMission(mission) {
    if (game.pendingMissions.length < settings.missionBoardCapacity && !game.pendingMissions.some(m => m.id === mission.id)) {
        game.pendingMissions.push(mission);
        // UI更新は呼び出し元(main.jsなど)に任せる
    }
}

function acceptMission(missionId) {
    if (game.currentMission) {
        showInfoToast("同時に複数のミッションは受けられません。");
        return;
    }

    const missionIndex = game.pendingMissions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) return; // Mission not found

    const missionToStart = game.pendingMissions.splice(missionIndex, 1)[0];
    
    startMission(missionToStart);
    
    hideMissionBoard();
    updateMissionBoardUI(); // これはui-missions.jsの関数
}

function discardMission(missionId) {
    showConfirmation("本当にこの依頼を破棄しますか？", () => {
        const missionIndex = game.pendingMissions.findIndex(m => m.id === missionId);
        if (missionIndex > -1) {
            game.pendingMissions.splice(missionIndex, 1);
            updateMissionBoardUI(); // これはui-missions.jsの関数
            showInfoToast("依頼を破棄しました。");
        }
    });
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

    // UI更新は呼び出し元に任せる
    updateMissionUI(); 
}

function updateMission() {
    if (!game.currentMission) return;

    const mission = game.currentMission;
    const data = mission.missionData;
    const elapsedTime = (Date.now() - mission.startTime) / 1000;

    if (elapsedTime >= mission.timeLimit) {
        endMission(false, true); // 時間切れで失敗
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
        endMission(true); // 成功
        return;
    }

    updateMissionUI(currentProgress); // これはui-missions.jsの関数
}

function endMission(isSuccess, isTimeout = false) {
    if (!game.currentMission) return;

    const mission = game.currentMission;
    const data = mission.missionData;

    if (isSuccess || isTimeout) {
        showMissionResultPopup(isSuccess, data, mission.rewardValue);
    } else {
        showInfoToast(`依頼「${data.name}」を破棄しました。`);
    }

    if (isSuccess) {
        giveReward(data.reward, mission.rewardValue);
        if (!data.id.startsWith('debug_')) {
            game.completedMissions.push(mission.id);
        }
    }
    
    if (data.cooldown) {
        game.missionCooldowns[mission.id] = Date.now() + (data.cooldown * 1000);
    }

    game.lastMissionEndTime = Date.now();
    game.currentMission = null;

    updateMissionBoardUI();
    updateMissionUI();
}

function abortMission() {
    if (!game.currentMission) return;

    showConfirmation("遂行中のミッションを破棄しますか？", () => {
        endMission(false, false); // 手動でのキャンセル
    });
}

function giveReward(reward, rewardValue) {
    switch (reward.type) {
        case 'giveIce':
            game.iceCreams += rewardValue;
            game.totalIceCreamsMade += rewardValue;
            break;
        case 'buff':
            // ここにバフ処理を追加します
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