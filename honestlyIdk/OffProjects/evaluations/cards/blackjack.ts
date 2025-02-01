const DEALER_STAY_AT = 17;
const DEALER_WONT_PLAY_BLACKJACKS = true;
const DEALER_HITS_ON_SOFT_LIMIT = true;

type Hand = { rawScore: number; aces: number; hasSingleCard: boolean };
type Table = { hand: Hand; dealer: Hand };

const scoreHand = (hand: Hand) => {
    let score = hand.rawScore;
    let aces = hand.aces;
    while (aces > 0 && score < 12) {
        aces--;
        score += 10;
    }
    return score;
};

const makeHandKey = (hand: Hand) =>
    `${hand.rawScore},${hand.aces},${hand.hasSingleCard}`;

const makeTableKey = (table: Table) =>
    `${makeHandKey(table.hand)};${makeHandKey(table.dealer)}`;

const handKeyToHand = (key: string) => {
    const split = key.split(",");
    return {
        rawScore: Number(split[0]),
        aces: Number(split[1]),
        hasSingleCard: split[2] === "true",
    };
};

const tableKeyToTable = (key: string) => {
    const split = key.split(";");
    return {
        hand: handKeyToHand(split[0]),
        dealer: handKeyToHand(split[1]),
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
    const key = makeTableKey(table);
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
    const key = makeTableKey(table);
    if (QHitCache[key] !== undefined) {
        // console.log("-->", QHitCache[key]);
        return QHitCache[key];
    }

    let Q = 0;
    for (let card = 1; card <= 10; card++)
        Q +=
            (VMax({
                hand: addCardToHand(table.hand, card),
                dealer: table.dealer,
            }) *
                (card === 10 ? 4 : 1)) /
            13;
    return cache(key, Q, QHitCache);
};

const QStayCache = {};
const QStay = (table: Table) => {
    // console.log("QStay", table);
    const key = makeTableKey(table);
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
        if (
            !(
                dealerScore === DEALER_STAY_AT &&
                DEALER_HITS_ON_SOFT_LIMIT &&
                table.dealer.rawScore < 12 &&
                table.dealer.aces > 0
            )
        ) {
            // Dealer stays
            if (dealerScore === handScore) return 0;
            return 1;
        }
    }

    let Q = 0;
    for (let card = 1; card <= 10; card++) {
        if (table.dealer.hasSingleCard) {
            // We are assuming the dealer does not have blackjack
            if (
                DEALER_WONT_PLAY_BLACKJACKS &&
                ((table.dealer.rawScore === 1 && card === 10) ||
                    (table.dealer.rawScore === 10 && card === 1))
            )
                continue;
        }
        Q +=
            (QStay({
                hand: table.hand,
                dealer: addCardToHand(table.dealer, card),
            }) *
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
    return scoreHand(table.hand) < 21 && scoreHand(table.dealer) < 21;
};

const addCardToHand = (hand: Hand, card: number) => ({
    rawScore: hand.rawScore + card,
    aces: hand.aces + (card === 1 ? 1 : 0),
    hasSingleCard: false,
});

const makeHandFromCards = (cards: number[]) => {
    let rawScore = 0;
    let aces = 0;
    for (let card of cards) {
        rawScore += card;
        aces += card === 1 ? 1 : 0;
    }
    return { rawScore, aces, hasSingleCard: cards.length === 1 };
};

const getAllPossibleResults = () => {
    const startTables = {};
    for (let i = 1; i <= 10; i++) {
        for (let j = i; j <= 10; j++) {
            for (let k = 1; k <= 10; k++) {
                const table = {
                    hand: makeHandFromCards([i, j]),
                    dealer: makeHandFromCards([k]),
                };
                startTables[makeTableKey(table)] = true;
            }
        }
    }
    const scoredByHandTotal: Record<
        number,
        Record<number, string | Record<string, string>>
    > = {};

    let nextTables = {};
    const seenTables = {};
    let hasChanged = false;

    const gradeTable = (table: Table) => {
        if (!doesGameStart(table)) return;

        const tableKey = makeTableKey(table);
        if (seenTables[tableKey]) return;
        hasChanged = true;
        seenTables[tableKey] = true;

        const [hit, stay] = choices(table);
        const handScore = scoreHand(table.hand);

        if (!scoredByHandTotal[handScore]) scoredByHandTotal[handScore] = {};

        const result =
            stay === hit ? "It do not matter" : stay > hit ? "Stay!" : "Hit!";

        if (hit >= stay) nextTables[makeTableKey(table)] = true;

        const handKey =
            table.hand.rawScore >= 12 || table.hand.aces === 0
                ? table.hand.rawScore
                : `w/ Ace`;

        if (!scoredByHandTotal[handScore][table.dealer.rawScore])
            scoredByHandTotal[handScore][table.dealer.rawScore] = {};
        if (
            scoredByHandTotal[handScore][table.dealer.rawScore][handKey] !==
                undefined &&
            scoredByHandTotal[handScore][table.dealer.rawScore][handKey] !==
                result
        )
            throw "WTF";
        scoredByHandTotal[handScore][table.dealer.rawScore][handKey] = result;
    };

    Object.keys(startTables).map(tableKeyToTable).map(gradeTable);

    while (hasChanged) {
        hasChanged = false;
        const toProcessTables = Object.keys(nextTables)
            .map(tableKeyToTable)
            .flatMap((table) => {
                return Array(10)
                    .fill(0)
                    .map((_, i) => ({
                        hand: addCardToHand(table.hand, i + 1),
                        dealer: table.dealer,
                    }));
            });
        nextTables = {};
        toProcessTables.map(gradeTable);
    }

    Object.keys(scoredByHandTotal).forEach((dealer) => {
        Object.keys(scoredByHandTotal[dealer]).forEach((totalScore) => {
            const possibleKeys = Object.keys(
                scoredByHandTotal[dealer][totalScore]
            );
            if (
                possibleKeys.every(
                    (key) =>
                        scoredByHandTotal[dealer][totalScore][key] ===
                        scoredByHandTotal[dealer][totalScore][possibleKeys[0]]
                )
            )
                scoredByHandTotal[dealer][totalScore] =
                    scoredByHandTotal[dealer][totalScore][possibleKeys[0]];
        });
    });

    console.log(scoredByHandTotal);
};

const calculateEstimatedProfit = () => {
    let sum = 0;

    for (let i = 1; i <= 13; i++) {
        for (let j = i; j <= 13; j++) {
            for (let k = 1; k <= 13; k++) {
                for (let l = 1; l <= 13; l++) {
                    const fullDealer = makeHandFromCards([
                        Math.min(k, 10),
                        Math.min(l, 10),
                    ]);
                    const table = {
                        hand: makeHandFromCards([
                            Math.min(i, 10),
                            Math.min(j, 10),
                        ]),
                        dealer: makeHandFromCards([Math.min(k, 10)]),
                    };
                    const handScore = scoreHand(table.hand);
                    const dealerScore = scoreHand(fullDealer);
                    if (dealerScore === 21) {
                        if (handScore === 21) continue;
                        sum -= 1;
                        continue;
                    }
                    if (handScore === 21) {
                        sum += 1.5;
                        continue;
                    }
                    sum += VMax(table);
                }
            }
        }
    }

    console.log(sum / 13 ** 4);
};

calculateEstimatedProfit();

export {};
