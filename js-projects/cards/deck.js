const VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
const SUITS = ["C", "S", "H", "D"];

const makeDeck = (numDecks = 1, dealtCards = [], numJokers = 0) => {
    const deck = [];

    [...Array(numDecks).keys()].forEach(() => {
        VALUES.forEach((v) => {
            SUITS.forEach((s) => {
                const usedCard = betterFind(dealtCards, [v, s]);
                if (usedCard > -1) dealtCards.splice(usedCard, 1);
                else deck.push([v, s]);
            });
        });
    });
    while ((joker = betterFind(dealtCards, ["R"])) > -1) {
        dealtCards.splice(joker, 1);
        numJokers--;
    }
    deck.push(...Array(numJokers > 0 ? numJokers : 0).fill(["R"]));
    return deck;
};

const isEqual = (a, b) => {
    if (typeof a !== typeof b) return false;
    if (typeof a !== "object") return a === b;
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    return Object.keys(a).every((key) => isEqual(a[key], b[key]));
};

const betterFind = (bigList, item) =>
    bigList.findIndex((i) => isEqual(i, item));

const takeCards = (deck, cardsToTake) => {
    const newDeck = [...deck];
    cardsToTake.forEach((c) => {
        const foundCard = betterFind(newDeck, c);
        if (foundCard > -1) newDeck.splice(foundCard, 1);
        else throw "Card not found in deck!";
    });
    return newDeck;
};

module.exports = { makeDeck, takeCards };