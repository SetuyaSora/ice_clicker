const gameMainAchievements = [
    // --- 難易度 1 ---
    {
        id: 'main_click_first', name: 'はじめてのクリック', description: '記念すべき最初の一杯。ここから全てが始まる。',
        icon: '👆', fame: 2, difficulty: 1, type: 'main',
        condition: { type: 'clicks', value: 1 }
    },
    {
        id: 'main_production_total100', name: '甘い一歩', description: 'アイス作りも、百個から。',
        icon: '🍨', fame: 2, difficulty: 1, type: 'main',
        condition: { type: 'totalIceCreams', value: 100 }
    },
    {
        id: 'main_building_grandpaCount1', name: 'おじいちゃん、よろしく！', description: '全ての始まり。おじいちゃんが作るアイスは、なぜか少し懐かしい味がする。',
        icon: '👴', fame: 2, difficulty: 1, type: 'main',
        condition: { type: 'specificBuildingCount', id: 'grandpa', value: 1 }
    },
    {
        id: 'main_ips_first', name: '小さな自動化', description: '放置していても、アイスは増える。素晴らしい世界の幕開けだ。',
        icon: '⚙️', fame: 2, difficulty: 1, type: 'main',
        condition: { type: 'ips', value: 1 }
    },
    {
        id: 'main_click_total1k', name: 'ダブルクリック', description: 'クリック回数が1,000回に到達した。マウスは友達。',
        icon: '🖱️', fame: 2, difficulty: 1, type: 'main',
        condition: { type: 'clicks', value: 1000 }
    },
    {
        id: 'main_production_total10k', name: 'アイスクリーム屋さん', description: '累計アイス生産数が1万個に到達。そろそろ店を構えますか？',
        icon: '🏪', fame: 2, difficulty: 1, type: 'main',
        condition: { type: 'totalIceCreams', value: 10000 }
    },
    {
        id: 'main_upgrade_first', name: '初めての投資', description: 'より甘い未来のために、今、投資する。',
        icon: '💡', fame: 2, difficulty: 1, type: 'main',
        condition: { type: 'upgradesPurchased', value: 1 }
    },
    {
        id: 'main_building_cartCount1', name: '町の人気者', description: 'チリンチリン♪ 軽快なベルの音と共に、街中に幸せを届ける。',
        icon: '🚲', fame: 2, difficulty: 1, type: 'main',
        condition: { type: 'specificBuildingCount', id: 'icecream_cart', value: 1 }
    },
    {
        id: 'main_building_grandpaCount10', name: 'チームおじいちゃん', description: 'おじいちゃんが10人集結。井戸端会議が始まりそうだ。',
        icon: '👨‍👨‍👦‍👦', fame: 2, difficulty: 1, type: 'main',
        condition: { type: 'specificBuildingCount', id: 'grandpa', value: 10 }
    },
    {
        id: 'main_click_power100', name: 'パワーアップ！', description: 'クリックの力が100に到達。指がディッシャーに見えてきた。',
        icon: '💪', fame: 2, difficulty: 1, type: 'main',
        condition: { type: 'clickStrength', value: 100 }
    },
    {
        id: 'main_system_achievementPanelOpen', name: '見るだけ', description: '実績画面を初めて開く。',
        icon: '👀', fame: 5, difficulty: 1, type: 'main',
        condition: { type: 'openAchievementPanel' }
    },

    // --- 難易度 2 ---
    {
        id: 'main_production_total1m', name: 'アイスクリーム工場長', description: '累計アイス生産数が100万個に到達。ヘルメットがよく似合う。',
        icon: '👷', fame: 5, difficulty: 2, type: 'main',
        condition: { type: 'totalIceCreams', value: 1000000 }
    },
    {
        id: 'main_building_factoryCount1', name: '大量生産の始まり', description: '巨大な製造ラインが24時間稼働。もはやアイスは工業製品。',
        icon: '🏭', fame: 5, difficulty: 2, type: 'main',
        condition: { type: 'specificBuildingCount', id: 'factory', value: 1 }
    },
    {
        id: 'main_ips_total1m', name: '百万馬力', description: '秒間アイス生産数（Ips）が100万に到達。もはや川の流れ。',
        icon: '🌊', fame: 5, difficulty: 2, type: 'main',
        condition: { type: 'ips', value: 1000000 }
    },
    {
        id: 'main_building_any100', name: '建てすぎ注意', description: 'いずれか1種類の施設を100個所有。景観を損なわないように。',
        icon: '🏘️', fame: 5, difficulty: 2, type: 'main',
        condition: { type: 'anyBuildingCount', value: 100 }
    },
    {
        id: 'main_production_total1b', name: '甘党の星', description: '累計アイス生産数が10億個に到達する。',
        icon: '🪐', fame: 5, difficulty: 2, type: 'main',
        condition: { type: 'totalIceCreams', value: 1000000000 }
    },
    {
        id: 'main_upgrade_total10', name: '技術革新', description: 'アップグレードを10種類購入する。',
        icon: '🛠️', fame: 5, difficulty: 2, type: 'main',
        condition: { type: 'upgradesPurchased', value: 10 }
    },
    {
        id: 'main_building_labCount1', name: '甘い研究', description: '「研究所」を1台所有する。',
        icon: '🔬', fame: 5, difficulty: 2, type: 'main',
        condition: { type: 'specificBuildingCount', id: 'laboratory', value: 1 }
    },
    {
        id: 'main_click_total100k', name: 'クリックマスター', description: '累計クリック回数が10万回に到達する。',
        icon: '🏆', fame: 5, difficulty: 2, type: 'main',
        condition: { type: 'clicks', value: 100000 }
    },
    {
        id: 'main_production_current100m', name: '億万長者', description: '所持アイスが1億個に到達する。',
        icon: '💰', fame: 5, difficulty: 2, type: 'main',
        condition: { type: 'iceCreams', value: 100000000 }
    },
    {
        id: 'main_building_total500', name: '甘い軍勢', description: '全施設の合計所有数が500個に到達する。',
        icon: '🏰', fame: 5, difficulty: 2, type: 'main',
        condition: { type: 'totalBuildings', value: 500 }
    },
    // --- 難易度 3 ---
    {
        id: 'main_production_total1t', name: 'アイスクリームの神', description: '累計アイス生産数が1兆個に到達する。',
        icon: '👑', fame: 10, difficulty: 3, type: 'main',
        condition: { type: 'totalIceCreams', value: 1000000000000 }
    },
    {
        id: 'main_building_moonbaseCount1', name: '宇宙進出', description: '「月面アイス基地」を1台所有する。',
        icon: '🚀', fame: 10, difficulty: 3, type: 'main',
        condition: { type: 'specificBuildingCount', id: 'moon_base', value: 1 }
    },
    {
        id: 'main_click_total1m', name: '指が燃えるほど', description: '累計クリック回数が100万回に到達する。',
        icon: '🔥', fame: 10, difficulty: 3, type: 'main',
        condition: { type: 'clicks', value: 1000000 }
    },
    {
        id: 'main_building_dimensionCount1', name: '次元を超える甘さ', description: '「アイスクリームの次元」を1つ所有する。',
        icon: '🌀', fame: 10, difficulty: 3, type: 'main',
        condition: { type: 'specificBuildingCount', id: 'dimension', value: 1 }
    },
    {
        id: 'main_building_blackholeCount1', name: 'もはや概念', description: '「ブラックホール冷凍庫」を1つ所有する。',
        icon: '🌌', fame: 10, difficulty: 3, type: 'main',
        condition: { type: 'specificBuildingCount', id: 'blackhole_freezer', value: 1 }
    },
    {
        id: 'main_ips_total1t', name: '無限の生産力', description: '秒間アイス生産数（Ips）が1兆に到達する。',
        icon: '♾️', fame: 10, difficulty: 3, type: 'main',
        condition: { type: 'ips', value: 1000000000000 }
    },
    {
        id: 'main_upgrade_all', name: 'コレクター魂', description: 'すべてのアップグレードを購入する。',
        icon: ' collector ', fame: 10, difficulty: 3, type: 'main',
        condition: { type: 'allUpgrades' }
    },
    {
        id: 'main_building_any500', name: '専門家', description: 'いずれか1種類の施設を500個所有する。',
        icon: '🎓', fame: 10, difficulty: 3, type: 'main',
        condition: { type: 'anyBuildingCount', value: 500 }
    },
    {
        id: 'main_building_all100', name: '支配者', description: '全ての施設を100個ずつ所有する。',
        icon: '🌍', fame: 10, difficulty: 3, type: 'main',
        condition: { type: 'allBuildingsCount', value: 100 }
    },
    {
        id: 'main_production_total1q', name: 'アイスクリームそのもの', description: '累計アイス生産数が1000兆個に到達する。',
        icon: '🍦', fame: 10, difficulty: 3, type: 'main',
        condition: { type: 'totalIceCreams', value: 1000000000000000 }
    },
];
