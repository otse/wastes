type speech = [text: string, follow: number]

const dialogues: speech[][] = [
    [
        // skip 0
    ],
    [
        // 1
        [`I'm a commmoner.`, -1]
    ],
    [
        // 2
        [`I'm a trader.`, 1],
        [`I mostly trade scrap nowadays. Always folk looking to tinker.`, 2],
        [`Take a look, it's not all junk.`, -1],
    ],
    [
        // 3
        [`I protect the civilized borders.`, 1],
        [`It may not look that civil at first glance.`, 2],
        [`But there's order to abide to.`, -1]
    ]
]

export default dialogues;