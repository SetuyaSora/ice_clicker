function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i = i + 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

function checkAchievements() {
    if (!settings.achievements) return;

    const totalBuildings = game.buildings.reduce((sum, b) => sum + b.count, 0);

    settings.achievements.forEach(ach => {
        if (game.unlockedAchievements.includes(ach.id)) return;

        let isUnlocked = false;
        const condition = ach.condition;

        switch (condition.type) {
            case 'totalIceCreams':
                if (game.totalIceCreamsMade >= condition.value) isUnlocked = true;
                break;
            case 'iceCreams':
                 if (game.iceCreams >= condition.value) isUnlocked = true;
                break;
            case 'clicks':
                if (game.clicks >= condition.value) isUnlocked = true;
                break;
            case 'anyBuildingCount':
                if (game.buildings.some(b => b.count >= condition.value)) isUnlocked = true;
                break;
            case 'specificBuildingCount':
                 const building = game.buildings.find(b => b.id === condition.id);
                 if (building && building.count >= condition.value) isUnlocked = true;
                break;
            case 'totalBuildings':
                if (totalBuildings >= condition.value) isUnlocked = true;
                break;
            case 'allBuildingsCount':
                const allMatch = settings.buildings.every(b_setting => {
                    const b_game = game.buildings.find(b => b.id === b_setting.id);
                    return b_game && b_game.count >= condition.value;
                });
                if(allMatch) isUnlocked = true;
                break;
            case 'ips':
                if (calculateIps() >= condition.value) isUnlocked = true;
                break;
            case 'upgradesPurchased':
                if(game.upgrades.length >= condition.value) isUnlocked = true;
                break;
            case 'allUpgrades':
                if (game.upgrades.length === settings.upgrades.length) isUnlocked = true;
                break;
            case 'clickStrength':
                if(calculateClickPower() >= condition.value) isUnlocked = true;
                break;
            case 'debug':
                if(game.debugMenuOpened) isUnlocked = true;
                break;
            // --- Secret Achievement Logic ---
            case 'specificBuildingOnly':
                const targetBuilding = game.buildings.find(b => b.id === condition.id);
                const otherBuildingsCount = game.buildings.filter(b => b.id !== condition.id).reduce((sum, b) => sum + b.count, 0);
                if (targetBuilding && targetBuilding.count >= condition.value && otherBuildingsCount === 0) isUnlocked = true;
                break;
            case 'lowClicksOnProduction':
                if (game.totalIceCreamsMade >= condition.productionGoal && game.clicks <= condition.maxClicks) isUnlocked = true;
                break;
            case 'lowBuildingCountOnProduction':
                if (game.totalIceCreamsMade >= condition.productionGoal && totalBuildings <= condition.maxBuildings) isUnlocked = true;
                break;
            case 'purchaseOrder':
                const buyBuilding = game.buildings.find(b => b.id === condition.buy);
                const beforeBuilding = game.buildings.find(b => b.id === condition.before);
                if (buyBuilding && buyBuilding.count > 0 && beforeBuilding && beforeBuilding.count === 0) isUnlocked = true;
                break;
            case 'uniformBuildingCount':
                const buildings = condition.ids.map(id => game.buildings.find(b => b.id === id));
                if (buildings.every(b => b && b.count >= condition.min)) {
                    const firstCount = buildings[0].count;
                    if (buildings.every(b => b.count === firstCount)) isUnlocked = true;
                }
                break;
            case 'allUnlockUpgradesPurchased':
                const unlockUpgrades = settings.upgrades.filter(u => u.effects.type === 'unlock');
                if (unlockUpgrades.every(u => game.upgrades.includes(u.id))) isUnlocked = true;
                break;
            case 'clicksOnlyProduction':
                if (game.totalIceCreamsMade >= condition.productionGoal && totalBuildings === 0) isUnlocked = true;
                break;
            case 'specificBuildingOnlyIps':
                const targetBuildingIps = game.buildings.find(b => b.id === condition.id);
                const otherBuildingsIps = game.buildings.filter(b => b.id !== condition.id).reduce((sum, b) => sum + b.count, 0);
                if (targetBuildingIps && targetBuildingIps.count > 0 && otherBuildingsIps === 0 && calculateIps() >= condition.ipsGoal) isUnlocked = true;
                break;
            case 'eliteBuildingsOnlyIps':
                const topBuildings = settings.buildings.slice(-condition.count).map(b => b.id);
                const hasOnlyElites = game.buildings.every(b => b.count === 0 || topBuildings.includes(b.id));
                if (hasOnlyElites && calculateIps() >= condition.ipsGoal) isUnlocked = true;
                break;
            case 'noClicksForDuration':
                if ((Date.now() - game.lastClickTimestamp) / 1000 >= condition.duration) {
                     if (condition.productionGoal) {
                        if (game.totalIceCreamsMade - game.iceCreamAtLastClick >= condition.productionGoal) isUnlocked = true;
                    } else {
                        isUnlocked = true;
                    }
                }
                break;
            case 'reversePurchaseOrder':
                const afterUnlock = game.upgrades.includes(condition.afterUnlock);
                const beforeBuy = game.buildings.find(b => b.id === condition.buy);
                if (afterUnlock && beforeBuy && beforeBuy.count === 0) isUnlocked = true;
                break;
            case 'buildingCountExceeds':
                const building1 = game.buildings.find(b => b.id === condition.id1);
                const building2 = game.buildings.find(b => b.id === condition.id2);
                if (building1 && building2 && building1.count > 0 && building1.count > building2.count) isUnlocked = true;
                break;
             case 'noClickUpgradesProduction':
                const hasClickUpgrade = game.upgrades.some(upId => settings.upgrades.find(u => u.id === upId)?.effects?.type === 'click');
                if (!hasClickUpgrade && game.totalIceCreamsMade >= condition.productionGoal) isUnlocked = true;
                break;
            case 'singleBuildingType':
                const ownedBuildings = game.buildings.filter(b => b.count > 0);
                if (ownedBuildings.length === 1 && ownedBuildings[0].count >= condition.count) isUnlocked = true;
                break;
            case 'allBuildingCountsPrime':
                const owned = game.buildings.filter(b => b.count > 0);
                if(owned.length > 0 && owned.every(b => b.count >= condition.min && isPrime(b.count))) isUnlocked = true;
                break;
            case 'lowUpgradeCountOnProduction':
                if (game.totalIceCreamsMade >= condition.productionGoal && game.upgrades.length <= condition.maxUpgrades) isUnlocked = true;
                break;
            case 'zeroClicksProduction':
                if (game.clicks === 0 && game.totalIceCreamsMade >= condition.productionGoal) isUnlocked = true;
                break;
            case 'minimalistIps':
                const allAreOne = game.buildings.every(b => b.count === 1 || b.count === 0);
                const ownedCount = game.buildings.filter(b => b.count > 0).length;
                if (allAreOne && ownedCount > 0 && calculateIps() >= condition.ipsGoal) isUnlocked = true;
                break;
            case 'solitaryBuildingIps':
                const soleBuilding = game.buildings.find(b => b.id === condition.id);
                const otherBuildingCount = game.buildings.filter(b => b.id !== condition.id).reduce((sum, b) => sum + b.count, 0);
                if(soleBuilding && soleBuilding.count > 0 && otherBuildingCount === 0 && calculateIps() >= condition.ipsGoal) isUnlocked = true;
                break;
            case 'noUpgradesProduction':
                if (game.upgrades.length === 0 && game.totalIceCreamsMade >= condition.productionGoal) isUnlocked = true;
                break;
            case 'leetCount':
                if (game.buildings.some(b => b.count === condition.value)) isUnlocked = true;
                break;
             case 'noFameProduction':
                if (game.famePoints === 0 && game.totalIceCreamsMade >= condition.productionGoal) isUnlocked = true;
                break;
        }

        if (isUnlocked) {
            unlockAchievement(ach.id, ach);
        }
    });
}

function checkEventAchievement(type, data) {
    settings.achievements.forEach(ach => {
        if (game.unlockedAchievements.includes(ach.id)) return;
        if (ach.condition.type === type) {
            let isUnlocked = false;
            switch (type) {
                case 'exactClickCount':
                    if (data.clicks === ach.condition.value) isUnlocked = true;
                    break;
                case 'cleanPurchase':
                    if (Math.floor(data.iceCreams) % 100 === 0) isUnlocked = true;
                    break;
                case 'openAchievementPanel':
                    isUnlocked = true;
                    break;
            }
            if(isUnlocked) unlockAchievement(ach.id, ach);
        }
    });
}

function unlockAchievement(achievementId, achievementData) {
    if (game.unlockedAchievements.includes(achievementId)) return;
    
    const achievement = achievementData || settings.achievements.find(a => a.id === achievementId);
    if (!achievement) return;

    game.unlockedAchievements.push(achievementId);
    game.famePoints += achievement.fame || 0;
    showAchievementToast(achievement.name);
    
    if (document.getElementById('achievements-panel').classList.contains('hidden') === false) {
        updateAchievementsPanelUI();
    }

    if (achievement.type === 'secret' && !game.secretTabUnlocked) {
        game.secretTabUnlocked = true;
        showSecretAchievementTab();
    }
}
