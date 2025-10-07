/**
 * 画面下部に情報トーストを表示します。
 * @param {string} message - 表示するメッセージ
 */
function showInfoToast(message) {
    toastInfoMessageEl.textContent = message;
    infoToast.classList.remove('translate-y-[200%]');
    setTimeout(() => {
        infoToast.classList.add('translate-y-[200%]');
    }, 3000);
}

/**
 * 画面下部に実績解除トーストを表示します。
 * @param {string} name - 解除した実績名
 */
function showAchievementToast(name) {
    toastAchievementNameEl.textContent = name;
    achievementToast.classList.remove('translate-y-[200%]');
    setTimeout(() => {
        achievementToast.classList.add('translate-y-[200%]');
    }, 3000);
}

/**
 * はい/いいえ を選択させる確認モーダルを表示します。
 * @param {string} message - 確認メッセージ
 * @param {function} onYes - 「はい」が押されたときに実行されるコールバック関数
 */
function showConfirmation(message, onYes) {
    const messageEl = document.getElementById('confirmation-message');
    const yesBtn = document.getElementById('confirmation-yes');
    const noBtn = document.getElementById('confirmation-no');

    messageEl.textContent = message;

    const yesHandler = () => {
        onYes();
        cleanup();
    };
    const noHandler = () => {
        cleanup();
    };
    const cleanup = () => {
        confirmationModal.classList.add('hidden');
        yesBtn.removeEventListener('click', yesHandler);
        noBtn.removeEventListener('click', noHandler);
    };

    yesBtn.addEventListener('click', yesHandler);
    noBtn.addEventListener('click', noHandler);
    
    confirmationModal.classList.remove('hidden');
}

/**
 * ミッションの結果（成功/失敗）をポップアップで表示します。
 * @param {boolean} isSuccess - ミッションが成功したかどうか
 * @param {object} missionData - ミッションの定義データ
 * @param {number} rewardValue - 計算済みの報酬額
 */
function showMissionResultPopup(isSuccess, missionData, rewardValue) {
    missionResultTitleEl.textContent = isSuccess ? '依頼達成！' : '依頼失敗…';
    
    let message = `<b>${missionData.name}</b>`;
    if (isSuccess) {
        const rewardText = getRewardText(missionData.reward, rewardValue);
        message += `<br>報酬: ${rewardText}！`;
    }

    missionResultMessageEl.innerHTML = message;

    missionResultContentEl.classList.remove('success', 'failure');
    missionResultContentEl.classList.add(isSuccess ? 'success' : 'failure');

    missionResultPopupEl.classList.remove('hidden');
    setTimeout(() => {
        missionResultPopupEl.classList.add('show');
    }, 10);

    let autoCloseTimer = null;
    let canClickClose = false;

    const closePopup = () => {
        missionResultPopupEl.classList.remove('show');
        setTimeout(() => {
            missionResultPopupEl.classList.add('hidden');
        }, 300);
        missionResultPopupEl.removeEventListener('click', handleClick);
        if (autoCloseTimer) {
            clearTimeout(autoCloseTimer);
        }
    };

    const handleClick = () => {
        if (canClickClose) {
            closePopup();
        }
    };
    
    missionResultPopupEl.addEventListener('click', handleClick);

    setTimeout(() => {
        canClickClose = true;
    }, 2000);

    autoCloseTimer = setTimeout(closePopup, 4000);
}
