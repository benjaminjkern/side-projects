const { makeDeck, takeCards } = require("./deck");

const sum = (array, f) => array.reduce((a, b) => a + (f ? f(b) : b), 0);

const isEqual = (a, b) => {
    if (typeof a !== typeof b) return false;
    if (typeof a !== "object") return a === b;
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    return Object.keys(a).every((key) => isEqual(a[key], b[key]));
};

const betterFind = (bigList, item) =>
    bigList.findIndex((i) => isEqual(i, item));

const score = (card) => {
    switch (card[0]) {
        case "J":
            return 10;
        case "Q":
            return 10;
        case "K":
            return 0;
        case "A":
            return 1;
        case "R": // Joker
            return -2;
        default:
            return card[0] - 0;
    }
};

const rotate = (hand, num = 1) => {
    if (num == 0) return hand;
    if (num > 1) return rotate(rotate(hand, num - 1));
    return hand[0].map((_, idx) => hand.map((line) => line[idx])).reverse();
};

const getRotations = (hand) => {
    if (hand.length == hand[0].length) {
        return [hand, rotate(hand), rotate(hand, 2), rotate(hand, 3)];
    }
    return [hand, rotate(hand, 2)];
};

const flip = (hand) => hand.map((row) => row.slice().reverse());

const compare = (hand1, hand2) => {
    if (hand1.length == 0) return -1;

    const flat1 = hand1.flat();
    const flat2 = hand2.flat();
    for (const idx in flat1) {
        if (flat1[idx][0] < flat2[idx][0]) return 1;
        if (flat1[idx][0] > flat2[idx][0]) return 2;
    }
    return 0;
};

const makeKey = (hand) =>
    stringify(
        [...getRotations(hand), ...getRotations(flip(hand))].reduce(
            (p, c) => (compare(p, c) == 1 ? p : c), []
        )
    );

const stringify = (hand) => hand.flat().map(stringCard) + "";

const stringTable = (table) => table.map(makeKey).join(";");

// returns value of card, if the card is unknown it still just returns '?'
const stringCard = (card) => card[0];

const shiftLeft = (array) => [...array.slice(1), array[0]];

const cache = (cacheToUse, key, value) => {
    cacheToUse[key] = value;
    return value;
};

const endGameCache = {};
const endGame = (table, cardToYou, cardsLeft) => {};

const VoptCache = {};
const Vopt = (table, cardOnDeck, turn, cardTaken, cardsLeft) => {
    const key =
        stringTable(table) +
        "|" +
        stringCard(cardOnDeck) +
        "|" +
        turn +
        "|" +
        cardTaken;
    if (VoptCache[key]) return VoptCache[key];

    if (!cardTaken) {
        let best = calcNextFromDeck(table, cardToYou, turn, cardsLeft)[0];

        for (let s in getPossibleSwitches(table[0])) {
            const switchScore = calcTakeCard(table, cardToYou, s, turn, cardsLeft);
            if (
                (turn == 0 && switchScore > best) ||
                (turn != 0 && switchScore < best)
            )
                best = score;
        }
        return cache(VoptCache, key, best);
    }
    let best = turn == 0 ? Number.MIN_VALUE : Number.MAX_VALUE;

    for (let s in getPossibleSwitches(table[0])) {
        const switchScore = calcTakeCard(table, cardToYou, s, turn, cardsLeft);
        if ((turn == 0 && switchScore > best) || (turn != 0 && switchScore < best))
            best = score;

        const flipScore = calcFlip(table, cardToYou, s, turn, cardsLeft);
        if ((turn == 0 && flipScore > best) || (turn != 0 && flipScore < best))
            best = score;
    }
    return cache(VoptCache, key, best);
};

// action: flip over next card from deck
const calcNextCardFromDeckCache = {};
const calcNextFromDeck = (table, cardOnDeck, turn, cardsLeft) => {
    const key = stringTable(table) + "|" + stringCard(cardOnDeck) + "|" + turn;
    if (calcNextCardFromDeckCache[key]) return calcNextCardFromDeckCache[key];

    return cache(
        calcNextCardFromDeckCache,
        key,
        cardsLeft.reduce((p, newCard) => {
            const newDeck = takeCards(cardsLeft, [newCard]);
            return p + Vopt(table, newCard, turn, newDeck);
        }, 0) / cardsLeft.length
    );
};

// action: switch one of your cards with the showing card
const calcTakeCardCache = {};
const calcTakeCard = (table, cardOnDeck, switchCard, turn, cardsLeft) => {
    const key =
        stringTable(table) +
        "|" +
        stringCard(cardOnDeck) +
        "|" +
        switchCard +
        "|" +
        turn;
    if (calcTakeCardCache[key]) return calcTakeCardCache[key];

    const oldCard = table[turn][switchCard[0]][switchCard[1]];
    const newTable = [...table];

    newTable[turn][switchCard[0]][switchCard[1]] = cardOnDeck;

    if (oldCard[0] === "?")
        return cache(
            calcTakeCardCache,
            key,
            cardsLeft.reduce((p, newCard) => {
                const newDeck = takeCards(cardsLeft, [newCard]);
                return p + Vopt(newTable, newCard, (turn + 1) % table.length, newDeck);
            }, 0) / cardsLeft.length
        );

    return cache(
        calcTakeCardCache,
        key,
        Vopt(newTable, oldCard, (turn + 1) % table.length, cardsLeft)
    );
};

const calcFlipCache = {};
const calcFlip = (table, cardOnDeck, switchCard, turn, cardsLeft) => {
    const key =
        stringTable(table) +
        "|" +
        stringCard(cardOnDeck) +
        "|" +
        switchCard +
        "|" +
        turn;
    if (calcFlipCache[key]) return calcFlipCache[key];

    return cache(
        calcFlipCache,
        key,
        cardsLeft.reduce((p, newCard) => {
            const newDeck = takeCards(cardsLeft, [newCard]);
            newTable[turn][switchCard[0]][switchCard[1]] = newCard;
            return p + Vopt(newTable, cardOnDeck, (turn + 1) % table.length, newDeck);
        }, 0) / cardsLeft.length
    );
};

const relativeScores = (table, cardToYou, cardTaken, turn, numDecks) => {
    const cardsLeft = makeDeck(
        numDecks, [
            ...table.reduce(
                (p, tHand) => [...p, ...tHand.filter((c) => c !== "?")], []
            ),
            cardToYou,
        ],
        2 * numDecks
    );
    console.log(cardsLeft);

    if (!cardTaken)
        return [
            calcNextFromDeck(table, cardToYou, cardsLeft), [...Array(table[0].length).keys()].map((s) =>
                calcTakeCard(table, cardToYou, s, cardsLeft)
            ),
        ];
    return [
        [...Array(table[0].length).keys()].map((s) =>
            calcTakeCard(table, cardToYou, s, cardsLeft)
        ), [...Array(table[0].length).keys()].map((s) =>
            calcFlip(table, cardToYou, s, cardsLeft)
        ),
    ];
};

const table = [
    ["?", "?", "?"],
    ["?", "?", "?"],
];
const cardToYou = ["R"];

// const allActions = relativeScores(table, cardToYou, false, 1);
// console.log(allActions);

console.log(
    makeKey([
        [
            ["R"],
            [2, "S"],
            ["R", "S"]
        ],
        [
            [4, "S"],
            [5, "S"],
            [6, "S"],
        ],
        [
            [9, "S"],
            [8, "S"],
            [7, "S"],
        ],
    ])
);