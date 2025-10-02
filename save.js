const SAVE_KEY_PREFIX = 'iceCreamClickerSave_';
const LAST_SLOT_KEY = 'iceCreamClickerLastSlot';
const AUTOSAVE_SLOT = 0;

function getSaveData(slot) {
    const savedData = localStorage.getItem(SAVE_KEY_PREFIX + slot);
    return savedData ? JSON.parse(savedData) : null;
}

function saveGameBySlot(slot) {
    const saveData = {
        iceCreams: game.iceCreams,
        totalIceCreamsMade: game.totalIceCreamsMade,
        clicks: game.clicks,
        buildings: game.buildings,
        upgrades: game.upgrades,
        unlockedAchievements: game.unlockedAchievements,
        famePoints: game.famePoints,
        secretTabUnlocked: game.secretTabUnlocked,
        currentMission: game.currentMission,
        completedMissions: game.completedMissions,
        missionCooldowns: game.missionCooldowns,
        lastMissionEndTime: game.lastMissionEndTime,
    };
    localStorage.setItem(SAVE_KEY_PREFIX + slot, JSON.stringify(saveData));
    localStorage.setItem(LAST_SLOT_KEY, slot);
}

function loadGameBySlot(slot) {
    const savedData = getSaveData(slot);
    if (savedData) {
        game.iceCreams = savedData.iceCreams || 0;
        game.totalIceCreamsMade = savedData.totalIceCreamsMade || 0;
        game.clicks = savedData.clicks || 0;
        game.buildings = savedData.buildings || [];
        game.upgrades = savedData.upgrades || [];
        game.unlockedAchievements = savedData.unlockedAchievements || [];
        game.famePoints = savedData.famePoints || 0;
        game.secretTabUnlocked = savedData.secretTabUnlocked || false;
        game.currentMission = savedData.currentMission || null;
        game.completedMissions = savedData.completedMissions || [];
        game.missionCooldowns = savedData.missionCooldowns || {};
        game.lastMissionEndTime = savedData.lastMissionEndTime || 0;
        
        localStorage.setItem(LAST_SLOT_KEY, slot);
        return true;
    }
    return false;
}

function autoSave() {
    saveGameBySlot(AUTOSAVE_SLOT);
}

function loadInitialData() {
    return loadGameBySlot(AUTOSAVE_SLOT);
}

