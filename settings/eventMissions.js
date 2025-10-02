const gameEventMissions = [
    {
        id: 'mission_production_rush_dynamic',
        name: '緊急大量生産！',
        description: '近くのお祭りでアイスが足りない！<br>3分以内にアイスを<b>{goal}個</b>、追加で納品してくれ！',
        trigger: [
            { type: 'ips', value: 1000 },
            { type: 'random', chance: 0.01 }
        ],
        condition: {
            type: 'earnIce',
            value: "ips * 180 * 0.5", // 3分間の総生産量の50%
            timeLimit: 180
        },
        reward: {
            type: 'giveIce',
            value: "goal * 0.5" // 目標の50%を報酬として
        }
    },
    {
        id: 'mission_click_maniac_dynamic',
        name: 'クリックマニア',
        description: '君の情熱を見せてみろ！<br>30秒以内に<b>{goal}回</b>クリックだ！',
        trigger: [
            { type: 'totalClicks', value: 500 },
            { type: 'random', chance: 0.02 }
        ],
        condition: {
            type: 'clickCount',
            value: "100 + totalClicks / 1000",
            timeLimit: 30
        },
        reward: {
            type: 'buff',
            effect: 'clickPower',
            multiplier: 3,
            duration: 60
        }
    },
    {
        id: 'mission_hyper_production',
        name: 'ハイパー生産モード！',
        description: '生産ラインが絶好調だ！<br>1分以内に<b>{goal}個</b>のアイスを生産しよう！',
        trigger: [
            { type: 'ips', value: 100000 },
            { type: 'random', chance: 0.005 }
        ],
        condition: {
            type: 'earnIce',
            value: "ips * 60 * 1.2", // 1分間の総生産量の120%。少し頑張る必要がある
            timeLimit: 60
        },
        reward: {
            type: 'giveIce',
            value: "ips * 120" // 現在のIpsの2分(120秒)分
        }
    },
    {
        id: 'mission_finger_sprint',
        name: '指先スプリント',
        description: '腕試しだ！<br>10秒以内に<b>{goal}回</b>クリックしてみろ！',
        trigger: [
            { type: 'clickStrength', value: 1000 },
             { type: 'random', chance: 0.01 }
        ],
        condition: {
            type: 'clickCount',
            value: 50,
            timeLimit: 10
        },
        reward: {
            type: 'buff',
            effect: 'clickPower',
            multiplier: 7,
            duration: 20
        }
    },
     {
        id: 'mission_grandpa_appreciation',
        name: 'おじいちゃん感謝祭',
        description: 'おじいちゃんたちが大活躍！<br>彼らの力だけで、5分以内に<b>{goal}個</b>のアイスを作ろう！',
        trigger: [
            { type: 'specificBuildingCount', id: 'grandpa', value: 50 },
            { type: 'random', chance: 0.003 }
        ],
        condition: {
            type: 'earnIce',
            value: "building_ips_grandpa * 300 * 0.8", // おじいちゃんの5分間の生産量の80%
            timeLimit: 300
        },
        reward: {
            type: 'buff',
            effect: 'buildingPower',
            buildingId: 'grandpa',
            multiplier: 5,
            duration: 600
        }
    }
];

