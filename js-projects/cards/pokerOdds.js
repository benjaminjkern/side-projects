const VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];

const bestHand = (cards) => {
    const sortedCards = cards.map((card) => "" + card);
    // straight flush
    if (straightFlush(cards)) return [8, matchedCards];
    // 4 of a kind
    if (fourKind(cards)) return [7, matchedCards];
    // full house
    if (fullHouse(cards)) return [6, matchedCards];
    // flush
    if (flush(cards)) return [];
    // straight
    // 3 of a kind
    // 2 pair
    // pair
    // high card
};

const straight = (cards) => {
    longestSubList(cards, ["A", ...VALUES]);
};