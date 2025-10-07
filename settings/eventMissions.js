const gameEventMissions = [
    // ========================================================================
    // --- 初期ミッション ---
    // ========================================================================
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
        trigger: { 
            type: 'specificBuildingCount', id: 'grandpa', value: 5 
        },
        condition: {
            type: 'earnIce', // じいちゃんを雇うミッションだが、条件は生産量
            value: 'ips * 60',
            timeLimit: 240 // 4分
        },
        reward: {
            type: 'giveIce',
            value: 'ips * 30'
        },
        cooldown: 600 // 10分
    },
    
    // ========================================================================
    // --- クリック回数系ミッション ---
    // ========================================================================
    {
        id: 'click_2',
        name: '連打の練習',
        description: 'クリックの嵐を巻き起こせ！<br>短期集中で{goal}回クリックだ！',
        trigger: { type: 'totalClicks', value: 500 },
        condition: {
            type: 'clickCount',
            value: '100 + totalClicks * 0.1',
            timeLimit: 60 // 1分
        },
        reward: {
            type: 'giveIce',
            value: 'clickStrength * 100'
        },
        cooldown: 1200 // 20分
    },
    {
        id: 'click_3',
        name: '指先のウォーミングアップ',
        description: '本気出す前に、指を温めておこう。<br>{goal}回のクリックで準備運動だ。',
        trigger: { type: 'totalClicks', value: 2000 },
        condition: {
            type: 'clickCount',
            value: '300 + totalClicks * 0.1',
            timeLimit: 90 // 1.5分
        },
        reward: {
            type: 'giveIce',
            value: 'clickStrength * 250'
        },
        cooldown: 1200 // 20分
    },
    {
        id: 'click_4',
        name: 'マウスへの感謝',
        description: 'いつもありがとう、マウス。<br>感謝を込めて{goal}回クリックしよう。',
        trigger: { type: 'totalClicks', value: 10000 },
        condition: {
            type: 'clickCount',
            value: '1000 + totalClicks * 0.05',
            timeLimit: 120 // 2分
        },
        reward: {
            type: 'giveIce',
            value: 'clickStrength * 500'
        },
        cooldown: 1800 // 30分
    },
    {
        id: 'click_5',
        name: 'ゾーン突入',
        description: 'もはや無心。ゾーンに入って<br>ひたすら{goal}回クリックし続けろ！',
        trigger: { type: 'totalClicks', value: 50000 },
        condition: {
            type: 'clickCount',
            value: '5000',
            timeLimit: 180 // 3分
        },
        reward: {
            type: 'giveIce',
            value: 'clickStrength * 1000'
        },
        cooldown: 1800 // 30分
    },
    {
        id: 'click_6',
        name: 'クリックの向こう側',
        description: 'クリックの真髄を見た者だけが<br>辿り着ける境地。{goal}クリックを目指せ。',
        trigger: { type: 'totalClicks', value: 100000 },
        condition: {
            type: 'clickCount',
            value: '10000',
            timeLimit: 240 // 4分
        },
        reward: {
            type: 'giveIce',
            value: 'ips * 60' // 報酬はIPSベースに
        },
        cooldown: 3600 // 60分
    },

    // ========================================================================
    // --- 全体生産量系ミッション ---
    // ========================================================================
    {
        id: 'earn_2',
        name: '軌道に乗って',
        description: '生産が安定してきたな。<br>この調子で{goal}個生産してみよう。',
        trigger: { type: 'totalIceCreams', value: 10000 },
        condition: {
            type: 'earnIce',
            value: 'ips * 60', // 1分間の生産量
            timeLimit: 180 // 3分
        },
        reward: {
            type: 'giveIce',
            value: 'ips * 30' // 30秒分の生産量
        },
        cooldown: 900 // 15分
    },
    {
        id: 'earn_3',
        name: '甘い雪崩',
        description: 'アイスが雪崩のように押し寄せる！<br>目標は{goal}個だ！',
        trigger: { type: 'totalIceCreams', value: 1000000 },
        condition: {
            type: 'earnIce',
            value: 'ips * 120', // 2分間の生産量
            timeLimit: 300 // 5分
        },
        reward: {
            type: 'giveIce',
            value: 'ips * 60' // 1分間の生産量
        },
        cooldown: 1200 // 20分
    },
    {
        id: 'earn_4',
        name: '地域の有名店',
        description: '町でウワサのアイスクリーム店。<br>次は{goal}個を目指そう！',
        trigger: { type: 'totalIceCreams', value: 100000000 },
        condition: {
            type: 'earnIce',
            value: 'ips * 180', // 3分間の生産量
            timeLimit: 420 // 7分
        },
        reward: {
            type: 'giveIce',
            value: 'ips * 90'
        },
        cooldown: 1800 // 30分
    },
    {
        id: 'earn_5',
        name: '生産ラインは快調',
        description: '工場はフル稼働！<br>目標、{goal}個！',
        trigger: { type: 'totalIceCreams', value: 10000000000 }, // 100億
        condition: {
            type: 'earnIce',
            value: 'ips * 300', // 5分間の生産量
            timeLimit: 600 // 10分
        },
        reward: {
            type: 'giveIce',
            value: 'ips * 150'
        },
        cooldown: 2700 // 45分
    },
    {
        id: 'earn_6',
        name: '甘い帝国',
        description: '世界は君のアイスを待っている。<br>次は{goal}個だ！',
        trigger: { type: 'totalIceCreams', value: 1000000000000 }, // 1兆
        condition: {
            type: 'earnIce',
            value: 'ips * 600', // 10分間の生産量
            timeLimit: 900 // 15分
        },
        reward: {
            type: 'giveIce',
            value: 'ips * 300'
        },
        cooldown: 3600 // 60分
    },

    // ========================================================================
    // --- 特定施設雇用系ミッション ---
    // ========================================================================
    {
        id: 'hire_cart_1',
        name: 'カート増員計画',
        description: '移動販売を強化しよう！<br>アイスクリームカートを{goal}台まで増やしてくれ。',
        trigger: { type: 'specificBuildingCount', id: 'icecream_cart', value: 10 },
        condition: {
            type: 'earnIce',
            value: 'ips * 100',
            timeLimit: 300 // 5分
        },
        reward: {
            type: 'giveIce',
            value: 'ips * 50'
        },
        cooldown: 900 // 15分
    },
    {
        id: 'hire_farm_1',
        name: '牧場主の依頼',
        description: 'もっとミルクが必要だ。<br>牛乳牧場を{goal}個まで増やしてくれないか？',
        trigger: { type: 'specificBuildingCount', id: 'milk_farm', value: 15 },
        condition: {
            type: 'earnIce',
            value: 'ips * 150',
            timeLimit: 360 // 6分
        },
        reward: {
            type: 'giveIce',
            value: 'ips * 75'
        },
        cooldown: 1200 // 20分
    },
    {
        id: 'hire_factory_1',
        name: '工場拡大プロジェクト',
        description: '生産能力を上げる時が来た。<br>アイス工場を{goal}個まで増設しよう。',
        trigger: { type: 'specificBuildingCount', id: 'factory', value: 20 },
        condition: {
            type: 'earnIce',
            value: 'ips * 200',
            timeLimit: 480 // 8分
        },
        reward: {
            type: 'giveIce',
            value: 'ips * 100'
        },
        cooldown: 1800 // 30分
    },
    {
        id: 'hire_lab_1',
        name: '研究員、募集中',
        description: '新たな味の探求は終わらない。<br>研究所を{goal}個まで増やしてくれたまえ。',
        trigger: { type: 'specificBuildingCount', id: 'laboratory', value: 25 },
        condition: {
            type: 'earnIce',
            value: 'ips * 250',
            timeLimit: 600 // 10分
        },
        reward: {
            type: 'giveIce',
            value: 'ips * 125'
        },
        cooldown: 2700 // 45分
    },
    {
        id: 'hire_moon_1',
        name: '月面開拓チーム',
        description: '宇宙へのロマンは終わらない！<br>月面アイス基地を{goal}個まで頼む！',
        trigger: { type: 'specificBuildingCount', id: 'moon_base', value: 30 },
        condition: {
            type: 'earnIce',
            value: 'ips * 300',
            timeLimit: 720 // 12分
        },
        reward: {
            type: 'giveIce',
            value: 'ips * 150'
        },
        cooldown: 3600 // 60分
    },


    // ========================================================================
    // --- デバッグ用ミッション ---
    // ========================================================================
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