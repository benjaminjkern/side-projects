require("colors");

const makeKey = game => `${[...game[0]].sort()};${[...game[1]].sort()}`;

const swap = game => [game[1], game[0]];

const getMoves = game => {
    return game[0].reduce((p, stick0, j) => {
        return stick0 === 0 || game[0].slice(j + 1).includes(stick0) ? p : [...p, ...game[1].map((stick1, i) => {
            if (stick1 === 0 || game[1].slice(i + 1).includes(stick1)) return [];
            const newGame = [
                [...game[0]],
                [...game[1]]
            ];
            newGame[1][i] = (stick0 + stick1) % 5;
            return swap(newGame);
        }).filter(newGame => newGame.length > 0)]
    }, []);
};

const testLoss = game => game[0][0] === 0 && game[0][1] === 0;

const cache = (myCache, key, value) => {
    myCache[key] = value;
    return value;
}


const VOptCache = {};
const VOpt = (game) => {
    const key = makeKey(game);
    if (VOptCache[key] !== undefined) return VOptCache[key];
    // console.log(key);
    cache(VOptCache, key, 0); // return 0 upon recursion

    if (testLoss(game)) return cache(VOptCache, key, -1);

    // console.log(getMoves(game));
    let best = -1;
    for (let nextGame of getMoves(game)) {
        const current = -VOpt(nextGame);
        if (current > best) best = current;
        if (best === 1) break;
    }
    return cache(VOptCache, key, best);
};

const relativeScores = (game) => getMoves(game).map(nextGame => ({
    [makeKey(nextGame)]: -VOpt(nextGame)
}));

const color = (finger, selected = false) => (finger + "")[finger === 0 ? 'gray' : selected ? 'bgYellow' : 'yellow'];


const display = (game, you = true, selection = -1) => {
    console.log(`
  ${you?' ':'>'}  ${game[1].map((finger) => color(finger)).join("   ")}
    
  ${you?'>':' '}  ${game[0].map((finger,i) => color(finger, selection === i)).join("   ")}
`);
};

const start = [
    [1, 1, 1],
    [1, 1, 1],
];

display(start);

// console.log(start);
// console.log(getMoves(start));

// console.log(VOpt(start));
console.log(relativeScores(start));

// console.log(Object.keys(VOptCache).reduce((p, c) => p + VOptCache[c], 0) / Object.keys(VOptCache).length);
// console.log(getMoves(start));
// console.log(VOptCache);
// console.log(getMoves(start));