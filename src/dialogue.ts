type speech = [text: string, follow: number]

const dialogues: speech[][] = [
    [
        // skip 0
        ['I got nothing to say.', -1]
    ],
    [
        // 1
        [`I'm a commmoner.`, -1]
    ],
    [
        // 2
        [`I'm the trader around here.`, 1],
        [`I mostly trade scrap nowadays.`, 2],
        [`Everyone furnishes their own things.`, -1],
    ],
    [
        // 3
        [`I protect the civilized borders.`, 1],
        [`It may not look that civil at first glance.`, 2],
        [`But there's a county to keep safe.`, -1]
    ],
    [
        // 4
        [`I live here.`, 1],
        [`You stalkers think you can survive out here. Don't be so content. Nothing is good.`, 2],
        [`The bayou swallows you up. You'll be another zombie.`, -1],
    ]
]

export default dialogues;