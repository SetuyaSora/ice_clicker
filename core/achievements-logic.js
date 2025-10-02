function checkAchievements() {
    if (!settings.achievements) return;
    settings.achievements.forEach(ach => {
        if (!game.unlockedAchievements.includes(ach.id)) {
            let isUnlocked = false;
            switch (ach.condition.type) {
                case 'totalIceCreams':
                    if (game.totalIceCreamsMade >= ach.condition.value) isUnlocked = true;
                    break;
                case 'clicks':
                    if (game.clicks >= ach.condition.value) isUnlocked = true;
                    break;
                case 'anyBuildingCount':
                    if (game.buildings.some(b => b.count >= ach.condition.value)) isUnlocked = true;
                    break;
                case 'specificBuildingCount':
                     const building = game.buildings.find(b => b.id === ach.condition.id);
                     if (building && building.count >= ach.condition.value) isUnlocked = true;
                    break;
                case 'allBuildingsOwned':
                    const allBuildingIds = settings.buildings.map(b => b.id);
                    if (allBuildingIds.every(id => game.buildings.find(b => b.id === id)?.count > 0)) isUnlocked = true;
                    break;
                case 'ips':
                    if (calculateIps() >= ach.condition.value) isUnlocked = true;
                    break;
                case 'upgradesPurchased':
                    if(game.upgrades.length >= ach.condition.value) isUnlocked = true;
                    break;
                case 'clickStrength':
                    if(calculateClickPower() >= ach.condition.value) isUnlocked = true;
                    break;
                case 'debug':
                    if(game.debugMenuOpened) isUnlocked = true;
                    break;
            }
            if (isUnlocked) {
                unlockAchievement(ach.id);
            }
        }
    });
}

function unlockAchievement(achievementId) {
    if (!game.unlockedAchievements.includes(achievementId)) {
        game.unlockedAchievements.push(achievementId);
        const achievement = settings.achievements.find(a => a.id === achievementId);
        
        if (achievement) {
            game.famePoints += achievement.fame || 0;
            showAchievementToast(achievement.name);
            updateAchievementsPanelUI();

            if (achievement.type === 'secret' && !game.secretTabUnlocked) {
                game.secretTabUnlocked = true;
                showSecretAchievementTab();
            }
        }
    }
}

