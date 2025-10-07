const gameEventMissions = [
    {
        id: 'earn_1',
        name: '最初の一歩',
        description: 'まずはアイスを {goal} 個生産してみよう。<br>簡単な目標だ。',
        trigger: {
            type: 'totalIceCreams',
            value: 10
        },
        condition: {
            type: 'earnIce',
            value: 'totalIceCreams * 0.5 + 50',
            timeLimit: 180 // 3分
        },
        reward: {
            type: 'giveIce',
            value: 'goal * 1.2'
        }
    },
    {
        id: 'click_1',
        name: 'クリッカーの心得',
        description: 'クリックこそ正義！<br>情熱の {goal} クリックを見せてくれ！',
        trigger: {
            type: 'totalClicks',
            value: 20
        },
        condition: {
            type: 'clickCount',
            value: 'totalClicks * 0.8 + 30',
            timeLimit: 120 // 2分
        },
        reward: {
            type: 'giveIce',
            value: 'clickStrength * 50'
        }
    },
    {
        id: 'grandpa_1',
        name: 'じいちゃんの応援',
        description: 'わしの仲間を増やしてくれんかの？<br>じいちゃんを{goal}人雇ってくれ！',
        trigger: [
            { type: 'specificBuildingCount', id: 'grandpa', value: 5 },
            { type: 'random', chance: 0.1 }
        ],
        condition: {
            type: 'earnIce',
            value: 'ips * 60',
            timeLimit: 240 // 4分
        },
        reward: {
            type: 'giveIce',
            value: 'ips * 30'
        },
        cooldown: 600 // 10分
    },
    // --- デバッグ用ミッション ---
    {
        id: 'debug_mission_1',
        name: 'デバッグ依頼: クリックしろ！',
        description: '開発者の魂の叫びを聞け！<br>とにかく10回クリックするんだ！',
        trigger: { 
            type: 'debug' // 通常のゲームプレイでは発生しないようにする
        },
        condition: {
            type: 'clickCount',
            value: 10, // 10回クリック
            timeLimit: 60 // 60秒
        },
        reward: {
            type: 'giveIce',
            value: 1000 // 報酬はアイス1000個
        }
    }
];
