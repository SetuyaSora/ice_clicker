function calculateIps() {
    let totalIps = 0;
    game.buildings.forEach(building => {
        if (building.count > 0) {
            const buildingSettings = settings.buildings.find(b => b.id === building.id);
            if (!buildingSettings || typeof buildingSettings.baseIps !== 'number') {
                console.error(`Invalid settings for building: ${building.id}`);
                return;
            }
            let buildingIps = buildingSettings.baseIps;
            game.upgrades.forEach(upgradeId => {
                const upgrade = settings.upgrades.find(u => u.id === upgradeId);
                if (upgrade && upgrade.effects && upgrade.effects.building === building.id) {
                    const multiplier = upgrade.effects.multiplier;
                    if (typeof multiplier === 'number') {
                        buildingIps *= multiplier;
                    } else {
                        console.error(`Invalid multiplier for upgrade: ${upgradeId}`);
                    }
                }
            });
            if (typeof building.count === 'number' && typeof buildingIps === 'number') {
                 totalIps += building.count * buildingIps;
            }
        }
    });
    return totalIps;
}

function calculateClickPower() {
    let power = 1;
    game.upgrades.forEach(upgradeId => {
        const upgrade = settings.upgrades.find(u => u.id === upgradeId);
        if (upgrade && upgrade.effects && upgrade.effects.type === 'click') {
            power *= upgrade.effects.multiplier;
        }
    });
    return power;
}

function buyBuilding(buildingId) {
    const building = game.buildings.find(b => b.id === buildingId);
    const buildingSettings = settings.buildings.find(b => b.id === buildingId);
    const cost = Math.ceil(buildingSettings.cost * Math.pow(1.15, building.count));
    if (Math.floor(game.iceCreams) >= cost) {
        game.iceCreams -= cost;
        building.count++;
        updateUI();
        checkAchievements();
    }
}

function buyUpgrade(upgradeId) {
    const upgrade = settings.upgrades.find(u => u.id === upgradeId);
    if (Math.floor(game.iceCreams) >= upgrade.cost && !game.upgrades.includes(upgradeId)) {
        game.iceCreams -= upgrade.cost;
        game.upgrades.push(upgradeId);
        if (upgrade.effects && upgrade.effects.type === 'unlock') {
            const buildingToUnlock = game.buildings.find(b => b.id === upgrade.effects.building);
            if (buildingToUnlock) {
                buildingToUnlock.displayed = true;
            }
        }
        updateUI();
        checkAchievements();
    }
}

function executeDebugCommand(command) {
    const parts = command.split(' ');
    const action = parts[0];
    const value = parseInt(parts[1], 10);
    let handledOwnUI = false;

    switch (action) {
        case 'addice':
            if (!isNaN(value)) {
                game.iceCreams += value;
                game.totalIceCreamsMade += value;
            }
            break;
        case 'unlockall':
            game.buildings.forEach(b => b.displayed = true);
            break;
        case 'reset':
            showConfirmation('本当にすべてのデータをリセットしますか？この操作は元に戻せません。', () => {
                localStorage.removeItem(LAST_SLOT_KEY);
                localStorage.removeItem(SAVE_KEY_PREFIX + AUTOSAVE_SLOT);
                for (let i = 1; i <= 3; i++) {
                    localStorage.removeItem(SAVE_KEY_PREFIX + i);
                }
                window.location.reload();
            });
            handledOwnUI = true;
            break;
        case 'unlockach':
             if(parts[1]) unlockAchievement(parts[1]);
             break;
    }
    updateUI();
    return handledOwnUI;
}

