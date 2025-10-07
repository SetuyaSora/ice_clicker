/**
 * セーブまたはロード用のモーダルウィンドウを開きます。
 * @param {'save' | 'load'} mode - 'save' または 'load'
 */
function openSaveLoadModal(mode) {
    const titleEl = document.getElementById('save-load-title');
    const containerEl = document.getElementById('save-slots-container');
    
    titleEl.textContent = mode === 'save' ? 'セーブ' : 'ロード';
    containerEl.innerHTML = '';

    for (let i = 1; i <= 3; i++) {
        const slotData = getSaveData(i);
        const slotEl = document.createElement('div');
        slotEl.className = 'p-3 rounded-lg flex items-center gap-4 border-2 border-yellow-400 bg-yellow-50';

        let content;
        if (slotData) {
            const date = new Date(slotData.timestamp || Date.now()).toLocaleString();
            content = `
                <div class="flex-grow">
                    <h3 class="font-bold text-lg">スロット ${i}</h3>
                    <p class="text-sm">アイス: ${formatNumber(Math.floor(slotData.iceCreams))}</p>
                    <p class="text-xs text-gray-500">最終セーブ: ${date}</p>
                </div>
                <div class="space-x-2 flex-shrink-0">
                    <button class="px-3 py-1 bg-yellow-400 rounded shadow clickable export-btn" data-slot="${i}">書き出し</button>
                    <button class="px-3 py-1 ${mode === 'save' ? 'bg-blue-500' : 'bg-green-500'} text-white rounded shadow clickable action-btn" data-slot="${i}">${mode === 'save' ? 'セーブ' : 'ロード'}</button>
                </div>
            `;
        } else {
            content = `
                <div class="flex-grow">
                    <h3 class="font-bold text-lg">スロット ${i}</h3>
                    <p class="text-sm">空のデータ</p>
                </div>
                <div class="space-x-2 flex-shrink-0">
                     <button class="px-3 py-1 ${mode === 'save' ? 'bg-blue-500' : 'bg-gray-400'} text-white rounded shadow clickable action-btn" data-slot="${i}" ${mode === 'load' ? 'disabled' : ''}>${mode === 'save' ? 'セーブ' : 'ロード'}</button>
                </div>
            `;
        }
        slotEl.innerHTML = content;
        containerEl.appendChild(slotEl);
    }

    containerEl.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const slot = e.target.dataset.slot;
            if (mode === 'save') {
                const existingData = getSaveData(slot);
                if (existingData) {
                    showConfirmation(`スロット${slot}のデータを上書きしますか？`, () => {
                        saveGameBySlot(slot);
                        openSaveLoadModal('save');
                        showInfoToast(`スロット${slot}にセーブしました。`);
                    });
                } else {
                    saveGameBySlot(slot);
                    openSaveLoadModal('save');
                    showInfoToast(`スロット${slot}にセーブしました。`);
                }
            } else {
                if (getSaveData(slot)) {
                    showConfirmation(`スロット${slot}のデータをロードしますか？`, () => {
                        loadGameBySlot(slot);
                        saveGameBySlot(AUTOSAVE_SLOT);
                        showInfoToast(`ロードが完了しました。ページが再読み込みされます。`);
                        setTimeout(() => window.location.reload(), 1500);
                    });
                }
            }
        });
    });
    
    containerEl.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const slot = e.target.dataset.slot;
            const data = getSaveData(slot);
            if (data) {
                const exportString = btoa(JSON.stringify(data));
                document.getElementById('export-textarea').value = exportString;
                exportModal.classList.remove('hidden');
            }
        });
    });

    saveLoadModal.classList.remove('hidden');
}

/**
 * セーブデータインポート用のモーダルウィンドウを開きます。
 */
function openImportModal() {
    const containerEl = document.getElementById('import-slots-container');
    containerEl.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
        containerEl.innerHTML += `
            <label class="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 border-2 border-yellow-400">
                <input type="radio" name="import-slot" value="${i}" class="form-radio h-5 w-5 text-yellow-500">
                <span class="font-bold">スロット ${i}</span>
            </label>
        `;
    }
    importModal.classList.remove('hidden');
}

/**
 * セーブ、ロード、インポート/エクスポート関連のUIイベントリスナーをセットアップします。
 */
function setupSaveLoadEventListeners() {
    saveBtn.addEventListener('click', () => openSaveLoadModal('save'));
    loadBtn.addEventListener('click', () => openSaveLoadModal('load'));
    importBtn.addEventListener('click', () => openImportModal());

    closeSaveLoadModalBtn.addEventListener('click', () => saveLoadModal.classList.add('hidden'));

    const closeExportBtn = document.getElementById('close-export-modal');
    closeExportBtn.addEventListener('click', () => exportModal.classList.add('hidden'));
    
    const copyExportBtn = document.getElementById('copy-export-data');
    copyExportBtn.addEventListener('click', () => {
        document.getElementById('export-textarea').select();
        document.execCommand('copy');
        showInfoToast("コピーしました！");
    });
    
    const closeImportBtn = document.getElementById('close-import-modal');
    closeImportBtn.addEventListener('click', () => importModal.classList.add('hidden'));
    
    const importDataBtn = document.getElementById('import-data-btn');
    importDataBtn.addEventListener('click', () => {
        const data = document.getElementById('import-textarea').value;
        const selectedSlotInput = document.querySelector('input[name="import-slot"]:checked');

        if (!selectedSlotInput) {
            showInfoToast("インポート先のスロットを選択してください。");
            return;
        }
        const slot = selectedSlotInput.value;

        try {
            const parsedData = JSON.parse(atob(data));
            if (parsedData && typeof parsedData.iceCreams === 'number') {
                const existingData = getSaveData(slot);
                const message = existingData 
                    ? `スロット${slot}のデータを上書きします。よろしいですか？`
                    : `空のスロット${slot}にデータをインポートします。よろしいですか？`;
                
                showConfirmation(message, () => {
                    localStorage.setItem(SAVE_KEY_PREFIX + slot, JSON.stringify(parsedData));
                    showInfoToast(`スロット${slot}にデータをインポートしました。`);
                    importModal.classList.add('hidden');
                });

            } else {
                throw new Error("Invalid save data.");
            }
        } catch (e) {
            showInfoToast("無効なセーブデータです。");
            console.error("Import failed:", e);
        }
    });
}
