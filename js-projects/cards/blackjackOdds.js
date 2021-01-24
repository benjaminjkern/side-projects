const sum = (array, f) => array.reduce((a, b) => a + (f ? f(a, b) : b), 0);

scoreHandMap = {};

const scoreHand = (array) => {
    key = stringify(array);
    if (scoreHandMap[key]) return scoreHandMap[key];

    scoreHandMap[key] = sum(array, score);
    return scoreHandMap[key];
};

const score = (total, card) => {
    switch (card[0]) {
        case "J":
            return 10;
        case "Q":
            return 10;
        case "K":
            return 10;
        case "A":
            return total > 10 ? 1 : 11;
        default:
            return card[0] - 0;
    }
};

const stringify = (array) =>
    array
    .map((c) => c[0])
    .sort()
    .join(",") + "";

let VoptMap = {};
let calcStayMap = {};
let calcHitMap = {};

const Vopt = (yourHand, dealer, cardsLeft, s = 1) => {
    const key = stringify(yourHand) + ";" + stringify(dealer) + ";" + s;
    if (VoptMap[key]) return VoptMap[key];

    if (dealer.length < 1) {
        VoptMap[key] =
            (1 / cardsLeft.length) *
            sum(
                cardsLeft.map((card) =>
                    Vopt(
                        yourHand,
                        dealer.concat([card]),
                        cardsLeft.filter((f) => !isEqual(f, card)),
                        s
                    )
                )
            );
        return VoptMap[key];
    }

    if (yourHand.length < 2) {
        VoptMap[key] = calcHit(yourHand, dealer, cardsLeft, s);
        return VoptMap[key];
    }

    const yourHandScore = scoreHand(yourHand);
    if (yourHandScore > 21) {
        VoptMap[key] = -1;
        return -1;
    }

    VoptMap[key] =
        s *
        Math.max(
            calcStay(yourHand, dealer, cardsLeft),
            calcHit(yourHand, dealer, cardsLeft, s)
        ) +
        (1 - s) *
        Math.min(
            calcStay(yourHand, dealer, cardsLeft),
            calcHit(yourHand, dealer, cardsLeft, s)
        );
    return VoptMap[key];
};

const calcHit = (yourHand, dealer, cardsLeft, s = 1) => {
    const key = stringify(yourHand) + ";" + stringify(dealer) + ";" + s;
    if (calcHitMap[key]) return calcHitMap[key];

    if (cardsLeft.length === 0) return calcStay(yourHand, dealer, cardsLeft, s);

    calcHitMap[key] =
        (1 / cardsLeft.length) *
        sum(
            cardsLeft.map((card) =>
                Vopt(
                    yourHand.concat([card]),
                    dealer,
                    cardsLeft.filter((f) => !isEqual(f, card)),
                    s
                )
            )
        );
    return calcHitMap[key];
};

const calcStay = (yourHand, dealer, cardsLeft) => {
    const key = stringify(yourHand) + ";" + stringify(dealer);
    if (calcStayMap[key]) return calcStayMap[key];

    const yourHandScore = scoreHand(yourHand);
    const dealerScore = scoreHand(dealer);

    if (yourHandScore > 21) {
        calcStayMap[key] = -1;
        return -1;
    }
    if (dealerScore > 21) {
        calcStayMap[key] = 1;
        return 1;
    }

    if (dealerScore < 17 && cardsLeft.length > 0) {
        calcStayMap[key] =
            (1 / cardsLeft.length) *
            sum(
                cardsLeft.map((card) =>
                    calcStay(
                        yourHand,
                        dealer.concat([card]),
                        cardsLeft.filter((f) => !isEqual(f, card))
                    )
                )
            );
        return calcStayMap[key];
    }
    calcStayMap[key] =
        dealerScore == yourHandScore ? 0 : dealerScore > yourHandScore ? -1 : 1;
    return calcStayMap[key];
};

const relativeScores = (myHand, currentDealer, table = [], numDecks = 1) => {
    const cardsLeft = require("./deck").makeDeck(numDecks, [
        ...myHand,
        ...currentDealer,
        ...table,
    ]);
    return [
        calcHit(myHand, currentDealer, cardsLeft),
        calcStay(myHand, currentDealer, cardsLeft),
    ];
};

const isEqual = (a, b) => {
    if (typeof a !== typeof b) return false;
    if (typeof a !== "object") return a === b;
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    return Object.keys(a).every((key) => isEqual(a[key], b[key]));
};

/*

Put in your hand, the current hand of the dealer, and any cards that are on the table

*/
const table = [
    [7, "H"],
    [10, "D"],
    [8, "S"],
    ["A", "D"],
];
const currentDealer = [
    ["K", "H"]
];
const myHand = [
    [7, "D"],
    [2, "C"],
    [7, "C"],
];
const scores = relativeScores(myHand, currentDealer, table, 1);

console.log(`Hit: ${scores[0]}
Stay: ${scores[1]}`);
console.log(
    scores[0] === scores[1] ?
    "The options are equivalent." :
    `You should \u001b[33m${scores[0] > scores[1] ? "Hit" : "Stay"}\u001b[0m.`
);