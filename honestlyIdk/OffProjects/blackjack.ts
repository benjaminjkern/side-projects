const DEALER_STAY_AT = 17;

type Table = { hand: number[]; dealer: number[] };

const scoreHand = (hand: number[]) => {
    let score = 0;
    let aces = 0;
    for (let card of hand) {
        if (card === 1) aces++;
        score += card;
    }
    while (aces > 0 && score < 12) {
        aces--;
        score += 10;
    }
    return score;
};

const makeKey = (table: Table) =>
    `${table.hand.sort().join(",")};${table.dealer.sort().join(",")}`;

const keyToTable = (key: string) => {
    const split = key.split(";");
    return {
        hand: split[0].split(",").map((card) => Number(card)),
        dealer: Number(split[1]),
    };
};

const cache = (
    key: string,
    value: number,
    cacheObj: Record<string, number>
) => {
    cacheObj[key] = value;
    return value;
};

const VMaxCache = {};
const VMax = (table: Table) => {
    // console.log("VMax", table);
    const key = makeKey(table);
    if (VMaxCache[key] !== undefined) {
        // console.log("-->", VMaxCache[key]);
        return VMaxCache[key];
    }

    const handScore = scoreHand(table.hand);
    if (handScore > 21) return -1;
    if (handScore === 21) return cache(key, QStay(table), VMaxCache);

    return cache(key, Math.max(QHit(table), QStay(table)), VMaxCache);
};

const QHitCache = {};
const QHit = (table: Table) => {
    // console.log("QHit", table);
    const key = makeKey(table);
    if (QHitCache[key] !== undefined) {
        // console.log("-->", QHitCache[key]);
        return QHitCache[key];
    }

    let Q = 0;
    for (let card = 1; card <= 10; card++)
        Q +=
            (VMax({ hand: [...table.hand, card], dealer: table.dealer }) *
                (card === 10 ? 4 : 1)) /
            13;
    return cache(makeKey(table), Q, QHitCache);
};

const QStayCache = {};
const QStay = (table: Table) => {
    // console.log("QStay", table);
    const key = makeKey(table);
    if (QStayCache[key] !== undefined) {
        // console.log("-->", QStayCache[key]);
        return QStayCache[key];
    }

    const handScore = scoreHand(table.hand);
    const dealerScore = scoreHand(table.dealer);
    if (handScore > 21) return -1;
    if (dealerScore > 21) return 1;
    if (dealerScore > handScore) return -1;
    if (dealerScore >= DEALER_STAY_AT) {
        if (dealerScore === handScore) return 0;
        return 1;
    }

    let Q = 0;
    for (let card = 1; card <= 10; card++) {
        if (table.dealer.length === 1) {
            // We are assuming the dealer does not have blackjack
            if (
                (table.dealer[0] === 1 && card === 10) ||
                (table.dealer[0] === 10 && card === 1)
            )
                continue;
        }
        Q +=
            (QStay({ hand: table.hand, dealer: [...table.dealer, card] }) *
                (card === 10 ? 4 : 1)) /
            13;
    }
    return cache(key, Q, QStayCache);
};

const choices = (table: Table) => {
    return [QHit(table), QStay(table)] as [number, number];
};

const doesGameStart = (table: Table) => {
    // Assumes this is a brand new table
    return scoreHand(table.hand) !== 21;
};

const allTables: Table[] = [];
for (let i = 1; i <= 10; i++) {
    for (let j = i; j <= 10; j++) {
        for (let k = 1; k <= 10; k++) {
            allTables.push({ hand: [i, j], dealer: [k] });
        }
    }
}

const scoredByHandTotal: Record<string, [number, number, number, string][]> =
    {};

const nextTables = {};

const gradeTable = (table: Table) => {
    if (!doesGameStart(table)) return;

    const [stay, hit] = choices(table);
    const handScore = scoreHand(table.hand);
    const aces = table.hand.reduce((p, c) => (c === 1 ? p + 1 : p), 0);
    const key = `${handScore},${aces}`;

    if (!scoredByHandTotal[key]) scoredByHandTotal[key] = [];

    const result = [
        ...table.dealer,
        stay,
        hit,
        stay === hit ? "It do not matter" : stay > hit ? "Stay!" : "Hit!",
    ] as [number, number, number, string];

    if (hit >= stay) nextTables[makeKey(table)] = true;

    if (
        scoredByHandTotal[key].some((innerResult) =>
            innerResult.every((value, i) => value === result[i])
        )
    )
        return;

    scoredByHandTotal[key].push(result);
};

allTables.map(gradeTable);

const rebuiltAllTables = Object.keys(nextTables);

console.log(scoredByHandTotal);
