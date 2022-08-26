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
        [`Everyone tinkers their own things.`, -1],
    ],
    [
        // 3
        [`I protect the civilized borders.`, 1],
        [`It may not look that civil at first glance.`, 2],
        [`But the county needs defendants.`, -1]
    ],
    [
        // 4
        [`I live here.`, 1],
        [`The bayou swallows you up.`, 2],
        [`You stalkers think you're survivors.`, 3],
        [`You'll be a zombie before you know it.`, -1],
    ]
]

export default dialogues;