const gameSecretAchievements = [
    // --- 難易度 1 ---
    {
        id: 'secret_challenge_grandpaOnly20', name: 'おじいちゃん一筋', description: '他の施設を一切買わずに「おじいちゃん」だけを20人雇う。',
        icon: '👴', fame: 5, difficulty: 1, type: 'secret',
        condition: { type: 'specificBuildingOnly', id: 'grandpa', value: 20 }
    },
    {
        id: 'secret_challenge_lowClicksFor1kIce', name: 'クリック禁止！', description: 'アイスを1000個生産するまでの間、クリック回数を10回以下に抑える。',
        icon: '🤫', fame: 5, difficulty: 1, type: 'secret',
        condition: { type: 'lowClicksOnProduction', maxClicks: 10, productionGoal: 1000 }
    },
    {
        id: 'secret_challenge_lowBuildingsFor10kIce', name: 'ミニマリスト', description: '累計生産数1万の時点で、施設の合計所有数が10個以下。',
        icon: '🧘', fame: 5, difficulty: 1, type: 'secret',
        condition: { type: 'lowBuildingCountOnProduction', maxBuildings: 10, productionGoal: 10000 }
    },
    {
        id: 'secret_challenge_skipDisher', name: '飛び級', description: '「アイスディッシャー」を買わずに「アイスクリームカート」を先に購入する。',
        icon: '🎓', fame: 5, difficulty: 1, type: 'secret',
        condition: { type: 'purchaseOrder', buy: 'icecream_cart', before: 'icecream_disher' }
    },
    {
        id: 'secret_challenge_exactClicks777', name: 'ラッキーセブン', description: '累計クリック回数がちょうど777回になる。',
        icon: '🎰', fame: 5, difficulty: 1, type: 'secret',
        condition: { type: 'exactClickCount', value: 777 }
    },
    {
        id: 'secret_system_debugOpen', name: 'テストプレイ？', description: '世界の裏側を覗いてしまったようだな…',
        icon: '🐛', fame: 5, difficulty: 1, type: 'secret',
        condition: { type: 'debug' }
    },
    {
        id: 'secret_challenge_uniformBuildings', name: '均等主義', description: '「おじいちゃん」「ディッシャー」「カート」をすべて同数（5個以上）所有する。',
        icon: '⚖️', fame: 5, difficulty: 1, type: 'secret',
        condition: { type: 'uniformBuildingCount', ids: ['grandpa', 'icecream_disher', 'icecream_cart'], min: 5 }
    },
    {
        id: 'secret_challenge_cleanPurchase', name: '潔癖症', description: 'アイスの所持数の下2桁が「00」の状態でアップグレードを購入する。',
        icon: '✨', fame: 5, difficulty: 1, type: 'secret',
        condition: { type: 'cleanPurchase' }
    },
    {
        id: 'secret_system_achievementPanelOpen', name: '見るだけ', description: '実績画面を初めて開く。',
        icon: '👀', fame: 5, difficulty: 1, type: 'secret',
        condition: { type: 'openAchievementPanel' }
    },
    {
        id: 'secret_challenge_allUnlockUpgrades', name: '無計画', description: '施設アンロック系のアップグレードをすべて購入する。',
        icon: '🗺️', fame: 5, difficulty: 1, type: 'secret',
        condition: { type: 'allUnlockUpgradesPurchased' }
    },
    // --- 難易度 2 ---
    {
        id: 'secret_challenge_clicksOnly100k', name: 'クリックこそ正義', description: '施設を一切買わずに、クリックだけで累計10万アイスを生産する。',
        icon: '👆', fame: 15, difficulty: 2, type: 'secret',
        condition: { type: 'clicksOnlyProduction', productionGoal: 100000 }
    },
    {
        id: 'secret_challenge_grandpaOnlyIps100', name: '始まりの人だけ', description: '「おじいちゃん」しか雇わずに秒間アイス生産数（Ips）を100にする。',
        icon: '👴', fame: 15, difficulty: 2, type: 'secret',
        condition: { type: 'specificBuildingOnlyIps', id: 'grandpa', ipsGoal: 100 }
    },
    {
        id: 'secret_challenge_eliteOnlyIps1t', name: 'エリート主義', description: '上位3種類の施設のみを所有してIpsを1兆にする。',
        icon: '🎩', fame: 15, difficulty: 2, type: 'secret',
        condition: { type: 'eliteBuildingsOnlyIps', count: 3, ipsGoal: 1000000000000 }
    },
    {
        id: 'secret_challenge_noClicksFor1mIce', name: '真の放置プレイ', description: '10分間、一度もクリックせずに100万アイスを生産する。',
        icon: '⏳', fame: 15, difficulty: 2, type: 'secret',
        condition: { type: 'noClicksForDuration', duration: 600, productionGoal: 1000000 }
    },
    {
        id: 'secret_challenge_reverseGrandpa', name: '逆張り', description: '「ブラックホール冷凍庫」をアンロックしてから「おじいちゃん」を初めて雇う。',
        icon: '🔄', fame: 15, difficulty: 2, type: 'secret',
        condition: { type: 'reversePurchaseOrder', buy: 'grandpa', afterUnlock: 'unlock_blackhole_freezer' }
    },
    {
        id: 'secret_challenge_factoryExceedsGrandpa', name: '下剋上', description: '「アイス工場」の所有数が「おじいちゃん」の所有数を超える。',
        icon: '📈', fame: 15, difficulty: 2, type: 'secret',
        condition: { type: 'buildingCountExceeds', id1: 'factory', id2: 'grandpa' }
    },
    {
        id: 'secret_challenge_noClickUpgradesFor1mIce', name: 'アップグレード不要', description: 'クリック強化系アップグレードを一切購入せずに、累計100万アイスを生産する。',
        icon: '🚫', fame: 15, difficulty: 2, type: 'secret',
        condition: { type: 'noClickUpgradesProduction', productionGoal: 1000000 }
    },
    {
        id: 'secret_challenge_singleBuildingType200', name: '一点集中', description: 'いずれか1種類の施設だけを200個所有する（他の施設は0）。',
        icon: '🎯', fame: 15, difficulty: 2, type: 'secret',
        condition: { type: 'singleBuildingType', count: 200 }
    },
    {
        id: 'secret_challenge_allBuildingsPrime', name: '数字の美学', description: '全ての施設の所有数を素数（11個以上）にする。',
        icon: '🧐', fame: 15, difficulty: 2, type: 'secret',
        condition: { type: 'allBuildingCountsPrime', min: 11 }
    },
    {
        id: 'secret_challenge_lowUpgradesFor100mIce', name: '節約家', description: '累計生産数1億の時点で、アップグレードの購入数が5個以下。',
        icon: '💸', fame: 15, difficulty: 2, type: 'secret',
        condition: { type: 'lowUpgradeCountOnProduction', maxUpgrades: 5, productionGoal: 100000000 }
    },
    // --- 難易度 3 ---
    {
        id: 'secret_challenge_clicksOnly100m', name: 'クリック神', description: '施設を一切買わずに、クリックだけで累計1億アイスを生産する。',
        icon: '🙏', fame: 30, difficulty: 3, type: 'secret',
        condition: { type: 'clicksOnlyProduction', productionGoal: 100000000 }
    },
    {
        id: 'secret_challenge_grandpaOnlyIps1m', name: '伝説の始まり', description: '「おじいちゃん」しか雇わずに秒間アイス生産数（Ips）を100万にする。',
        icon: '📜', fame: 30, difficulty: 3, type: 'secret',
        condition: { type: 'specificBuildingOnlyIps', id: 'grandpa', ipsGoal: 1000000 }
    },
    {
        id: 'secret_challenge_zeroClicksFor1Ice', name: '虚無からの創生', description: 'ゲーム開始から一度もクリックせずに累計1アイスを生産する。',
        icon: '🌌', fame: 30, difficulty: 3, type: 'secret',
        condition: { type: 'zeroClicksProduction', productionGoal: 1 }
    },
    {
        id: 'secret_challenge_minimalistIps1b', name: 'ミニマムクリア', description: '全ての施設を1つずつしか所有しない状態で、Ipsを10億にする。',
        icon: ' Bonsai ', fame: 30, difficulty: 3, type: 'secret',
        condition: { type: 'minimalistIps', ipsGoal: 1000000000 }
    },
    {
        id: 'secret_challenge_solitaryBlackholeIps1t', name: '孤高の存在', description: '「ブラックホール冷凍庫」を1つだけ所有し、他の施設は全て0の状態でIpsを1兆にする。',
        icon: '☄️', fame: 30, difficulty: 3, type: 'secret',
        condition: { type: 'solitaryBuildingIps', id: 'blackhole_freezer', ipsGoal: 1000000000000 }
    },
    {
        id: 'secret_challenge_noClicksFor1h', name: '我慢の限界', description: '1時間、一度もクリックせずにゲームを放置する。',
        icon: '🗿', fame: 30, difficulty: 3, type: 'secret',
        condition: { type: 'noClicksForDuration', duration: 3600 }
    },
    {
        id: 'secret_challenge_noUpgradesFor1tIce', name: '無強化の王', description: 'アップグレードを一切購入せずに、累計1兆アイスを生産する。',
        icon: '🦁', fame: 30, difficulty: 3, type: 'secret',
        condition: { type: 'noUpgradesProduction', productionGoal: 1000000000000 }
    },
    {
        id: 'secret_challenge_leetCount', name: '1337', description: 'いずれかの施設の所有数をちょうど1337個にする。',
        icon: '👾', fame: 30, difficulty: 3, type: 'secret',
        condition: { type: 'leetCount', value: 1337 }
    },
    {
        id: 'secret_challenge_lowClicksFor1bIce', name: '完全なる放置', description: '累計クリック回数100回未満で、累計10億アイスを生産する。',
        icon: '🍃', fame: 30, difficulty: 3, type: 'secret',
        condition: { type: 'lowClicksOnProduction', maxClicks: 99, productionGoal: 1000000000 }
    },
    {
        id: 'secret_challenge_noFameFor1tIce', name: '名声はいらない', description: '名声ポイントを1も獲得せずに、累計1兆アイスを生産する。',
        icon: '🧘‍♂️', fame: 30, difficulty: 3, type: 'secret',
        condition: { type: 'noFameProduction', productionGoal: 1000000000000 }
    },
];
