NUMDECKS = 10000;
DEALER_STAY_AT = 17;

countOccurances = fn: [Any] list -> list.reduce {}: p, c -> p | {c: (p[c] || 0) + 1}

drawCardProbs = fn: Num* existingCards ->
    counts = existingCards |> countOccurances
    cardsLeft = NUMDECKS * 52 - existingCards.length

    return dict.union [1..10]: card -> math.max(0, (NUMDECKS * 4 * (card === 10 ? 4 : 1) - (counts[card] || 0)) / cardsLeft)

scoreHand = fn: list ->
    score = 0
    aces = 0
    for list: card ->
        score += Num card
        if card == 1: aces += 1
    
    while aces > 0 and score <= 11:
        aces -= 1
        score += 10

    return score


typeof for # Collection => Instantiator

const scoreHand = list => {
    let score = 0;
    let aces = 0;
    for (let card of list) {
        score += card - 0;
        if (card === 1) aces++;
    }
    while (aces > 0 && score <= 11) {
        aces--;
        score += 10;
    }
    return score;
}

const makeKey = (hand, dealer, table) => {
    hand.sort();
    dealer.sort();
    table.sort();
    return `${hand.join(',')};${dealer.join(',')};${table.join(',')}`
}

const cache = (key, value, cacheObj) => {
    cacheObj[key] = value;
    return value;
}

const VMaxCache = {};
const VMax = (hand, dealer, table = []) => {
    // console.log(`VMax([${hand.join(',')}], [${dealer.join(',')}])`);
    const key = makeKey(hand, dealer, table);
    if (VMaxCache[key]) return VMaxCache[key];

    const handScore = scoreHand(hand);
    if (handScore > 21) return -1;
    if (handScore === 21) return cache(key, QStay(hand, dealer, table), VMaxCache);

    return cache(key, Math.max(QHit(hand, dealer, table), QStay(hand, dealer, table)), VMaxCache);
}

const QHit = (hand, dealer, table = []) => {
    // console.log(`QHit([${hand.join(',')}], [${dealer.join(',')}])`);
    const probs = drawCardProbs(...hand, ...dealer, ...table);

    let Q = 0;
    for (const card in probs) {
        if (probs[card] > 0)
            Q += VMax([...hand, card], dealer, table) * probs[card];
    }
    return Q;
}

const QStayCache = {};
const QStay = (hand, dealer, table = []) => {
    // console.log(`QStay([${hand.join(',')}], [${dealer.join(',')}])`);
    const key = makeKey(hand, dealer, table);
    if (VMaxCache[key]) return VMaxCache[key];

    const handScore = scoreHand(hand);
    const dealerScore = scoreHand(dealer);
    if (handScore > 21) return -1;
    if (dealerScore > 21) return 1;
    if (dealerScore > handScore) return -1;
    if (dealerScore >= DEALER_STAY_AT) {
        if (dealerScore === handScore) return 0;
        return 1;
    }


    const probs = drawCardProbs(...hand, ...dealer, ...table);

    let Q = 0;
    for (const card in probs) {
        Q += QStay(hand, [...dealer, card], table) * probs[card];
    }
    return cache(key, Q, QStayCache);
}

const choices = (hand, dealer, table = []) => {
    return [QHit(hand, dealer, table), QStay(hand, dealer, table)];
}

const allTables = [];
for (let i = 1; i <= 10; i++) {
    for (let j = i; j <= 10; j++) {
        for (let k = 1; k <= 10; k++) {
            allTables.push([[i, j], [k]]);
        }
    }
}

allTables.map(table => {
    const c = choices(...table)
    console.log(table, c, c[0] > c[1] ? "Hit!" : (c[0] === c[1] ? "It do not matter!" : "Stay!"), Math.max(...c));
})

// console.log(allTables.reduce((sum, table) => sum + VMax(...table), 0) / allTables.length);

// console.log(choices([10, 10], [2]));