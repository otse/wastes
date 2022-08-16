type speech = [text: string, follow: number]

const dialogues: speech[][] = [
    [
        //['I spent some of my time sewing suits for wasters.', 3]
    ],
    [
        [`I'm a trader.`, 1],
        [`It can be hazardous around here. The purple for example is contaminated soil.`, 2],
        [`It won't hurt, but be wary, the more blighted, the more danger that can usually be found.`, -1],
    ],
    [
        [`I'm a vendor of sifty town.`, 1],
        [`I trade in most forms of scraps.`, 2],
        [`.`, 3]
    ]
]

export default dialogues;