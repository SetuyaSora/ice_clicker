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
        pendingMissions: game.pendingMissions, // ミッションボードの状態を追加
        timestamp: Date.now()
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
        game.pendingMissions = savedData.pendingMissions || []; // ミッションボードの状態をロード
        
        localStorage.setItem(LAST_SLOT_KEY, slot);
        return true;
    }
    return false;
}

function autoSave() {
    saveGameBySlot(AUTOSAVE_SLOT);
}

function loadInitialData() {
    const lastSlot = localStorage.getItem(LAST_SLOT_KEY);
    // 最後にセーブしたスロット、もしくはオートセーブスロットからロードを試みる
    return loadGameBySlot(lastSlot !== null ? lastSlot : AUTOSAVE_SLOT);
}

/**
 * すべてのセーブデータを削除し、ゲームを初期状態に戻します。
 */
function resetGame() {
    // オートセーブとスロット1〜3のデータを削除
    localStorage.removeItem(LAST_SLOT_KEY);
    localStorage.removeItem(SAVE_KEY_PREFIX + AUTOSAVE_SLOT);
    for (let i = 1; i <= 3; i++) {
        localStorage.removeItem(SAVE_KEY_PREFIX + i);
    }
    // ページをリロードして変更を適用
    window.location.reload();
}

