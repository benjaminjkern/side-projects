const readline = require('readline-sync');
require('colors');

const scoreCard = (card) => {
    switch (card[0]) {
        case 'A': return 14;
        case 'K': return 13;
        case 'Q': return 12;
        case 'J': return 11;
        case 'T': return 10;
    }
    return card[0] - 0;
}

const allHands = (cards, n) => {
    if (n === 0) return [[]];
    if (cards.length === n) return [cards];
    if (cards.length < n) return [];
    return [...allHands(cards.slice(1), n - 1).map(hand => [cards[0], ...hand]), ...allHands(cards.slice(1), n)];
}

const allUniqueHands = (cards, n) => {
    const hands = allHands(cards, n);
    const handSet = {};
    for (const hand of hands) {
        handSet[createKey(hand + '')] = true;
    }
    return Object.keys(handSet).map(handString => handString.split(','));
}

const effectivelyEqual = (hand1, hand2) => createKey(hand1 + '') === createKey(hand2 + '');

const sortCards = (cards) => {
    return cards.sort((a, b) => scoreCard(b) - scoreCard(a));
}

const scoreRest = (scores) => scores.reduce((p, c, i) => p + c / (100 ** (i + 1)), 0);

const getAllRelevantMatches = (cards, count = 4) => {
    const matches = Array(count).fill().map(() => []);
    cardloop: for (const card of cards) {
        const score = scoreCard(card);
        for (const [i, match] of matches.slice(1).entries()) {
            if (match[match.length - 1] === score) {
                match.pop();
                matches[i].push(score);
                continue cardloop;
            }
        }
        matches[matches.length - 1].push(score);
    }
    return matches;
}

const scoreHand = (cards, sorted) => {
    if (cards.length < 5) throw "Can only score hands with 5 cards or more";

    if (!sorted) sortCards(cards);

    const straightCards = [...cards];
    cards.forEach(card => { if (card[0] === 'A') straightCards.push(card); });

    let straightFlush = [];
    straightFlushLoop: for (const [i, card1] of straightCards.slice(0, straightCards.length - 4).entries()) {
        straightFlush = [scoreCard(card1)];
        for (const [j, card2] of straightCards.slice(i + 1).entries()) {
            if (straightFlush.length === 5) break straightFlushLoop;
            if (straightFlush.length + straightCards.length - i - 1 - j < 5) break;
            const scoreCard2 = scoreCard(card2);
            if (straightFlush[straightFlush.length - 1] - scoreCard2 >= 2) break;
            if ((straightFlush[straightFlush.length - 1] - scoreCard2 === 1 ||
                (straightFlush[straightFlush.length - 1] === 2 && scoreCard2 === 14)) && card2[1] === card1[1]) straightFlush.push(scoreCard2);
        }
        if (straightFlush.length === 5) break;
    }
    if (straightFlush.length === 5) return 8 + straightFlush[0] / 100;

    const scores = cards.map(scoreCard);
    const [fourKind, threeKind, pairs, singles] = getAllRelevantMatches(cards);

    if (fourKind.length > 0) return 7 + fourKind[0] / 100 + scores.filter(score => score !== fourKind[0])[0] / 10000;

    if (threeKind.length > 0 && pairs.length > 0) return 6 + threeKind[0] / 100 + pairs[0] / 10000;

    let flush = [];
    flushLoop: for (const [i, card1] of cards.slice(0, cards.length - 4).entries()) {
        flush = [scoreCard(card1)];
        for (const [j, card2] of cards.slice(i + 1).entries()) {
            if (flush.length === 5) break flushLoop;
            if (flush.length + cards.length - i - 1 - j < 5) break;
            if (card2[1] === card1[1]) flush.push(scoreCard(card2));
        }
        if (flush.length === 5) break;
    }
    if (flush.length === 5) return 5 + scoreRest(flush);

    let straight = [];
    straightLoop: for (const [i, card1] of straightCards.slice(0, straightCards.length - 4).entries()) {
        straight = [scoreCard(card1)];
        for (const [j, card2] of straightCards.slice(i + 1).entries()) {
            if (straight.length === 5) break straightLoop;
            if (straight.length + straightCards.length - i - 1 - j < 5) break;
            const scoreCard2 = scoreCard(card2);
            if (straight[straight.length - 1] - scoreCard2 >= 2) break;
            if (straight[straight.length - 1] - scoreCard2 === 1 || (straight[straight.length - 1] === 2 && scoreCard2 === 14)) straight.push(scoreCard2);
        }
        if (straight.length === 5) break;
    }
    if (straight.length === 5) return 4 + straight[0] / 100;

    if (threeKind.length > 0) return 3 + threeKind[0] / 100 + scoreRest(scores.filter(score => score !== threeKind[0]).slice(0, 2)) / 100;

    if (pairs.length === 2) return 2 + pairs[0] / 100 + pairs[1] / 10000 + scores.filter(score => score !== pairs[0] && score !== pairs[1])[0] / 1000000;

    if (pairs.length === 1) return 1 + pairs[0] / 100 + scoreRest(scores.filter(score => score !== pairs[0]).slice(0, 3)) / 100;

    return scoreRest(scores.slice(0, 5));
}

const allPermutations = (list) => {
    if (list.length === 1) return [list];
    return list.reduce((p, first, i) => [...p, ...allPermutations(list.filter((_, j) => i != j)).map(perm => [first, ...perm])], []);
}

const swapOut = (string, toSwap, replacements) => {
    let newString = string;
    toSwap.forEach((s, i) => newString = newString.replace(new RegExp(s, 'g'), `~${i}~`));
    replacements.forEach((r, i) => newString = newString.replace(new RegExp(`~${i}~`, 'g'), r));
    return newString;
}

const createKey = (keyString) => {
    // Applies all possible switches and then takes the one that is alphabetically first
    const allStrings = allPermutations(SUITS).map(perm => swapOut(keyString, SUITS, perm)).sort();
    return allStrings[0];
}

const winCache = {};
const probWinning = (hand, opponentCount, table = [], opponents = [], sorted = false) => {
    if (!sorted) {
        sortCards(hand);
        sortCards(table);
        opponents.forEach(opponent => sortCards(opponent));
    }
    const key = createKey(`[${hand}],${opponentCount},[${table}],[${opponents.map(opponent => `[${opponent}]`).sort()}]`);
    // console.log(key);

    if (winCache[key] !== undefined) return winCache[key];
    const newPossibleCards = DECK.filter(card => !hand.includes(card) && !table.includes(card) && !opponents.some(hand => hand.includes(card)));

    if (opponentCount > 0) {
        const newHands = allHands(newPossibleCards, 2);
        winCache[key] = newHands.reduce((sum, opponentHand) => sum + probWinning(hand, opponentCount - 1, table, [...opponents, opponentHand], true), 0) / newHands.length;
        return winCache[key];
    }

    if (table.length < 5) {
        const newTables = allHands(newPossibleCards, 5 - table.length);
        winCache[key] = newTables.reduce((sum, newTable) => sum + probWinning(hand, 0, sortCards([...table, ...newTable]), opponents, true), 0) / newTables.length;
        return winCache[key];
    }


    winCache[key] = isWinner(hand, opponents, table);
    return winCache[key];
};

const isWinner = (hand, opponents, table) => {
    const myScore = scoreHand([...hand, ...table]);
    let tie = false;
    for (const opponentHand of opponents) {
        const oScore = scoreHand([...opponentHand, ...table]);
        if (oScore > myScore) return -1;
        if (oScore === myScore) tie = true;
    }
    return tie ? 0 : 1;
}

const multiEstimated = (hand, opponentCount, table = [], opponents = [], numToRun = 10, numToRun2 = 100, possibleOpponentHands) => {
    let [sumWins, sumWinSquares, sumTies, sumTieSquares] = [0, 0, 0, 0];
    for (let i = 0; i < numToRun; i++) {
        const values = estimatedProbs(hand, opponentCount, table, opponents, numToRun2, possibleOpponentHands);
        [sumWins, sumWinSquares, sumTies, sumTieSquares] = [sumWins + values[0], sumWinSquares + values[0] ** 2, sumTies + values[1], sumTieSquares + values[1] ** 2];
    }
    return {
        win: [sumWins / numToRun, Math.sqrt(sumWinSquares / numToRun - (sumWins / numToRun) ** 2)],
        tie: [sumTies / numToRun, Math.sqrt(sumTieSquares / numToRun - (sumTies / numToRun) ** 2)],
    }
}

const estimatedProbs = (hand, opponentCount, table = [], opponents = [], numToRun = 100, possibleOpponentHands) => {
    let [sumWins, sumTies] = [0, 0];
    for (let i = 0; i < numToRun; i++) {
        const value = randomGame(hand, opponentCount, table, opponents, possibleOpponentHands);
        [sumWins, sumTies] = [sumWins + (value === 1 ? 1 : 0), sumTies + (value === 0 ? 1 : 0)];
    }
    return [sumWins / numToRun, sumTies / numToRun];
}

const randomGame = (hand, opponentCount, table = [], opponents = [], possibleOpponentHands) => {
    const newPossibleCards = DECK.filter(card => !hand.includes(card) && !table.includes(card) && !opponents.some(hand => hand.includes(card)));

    if (!possibleOpponentHands) {
        for (const opponentHand of opponents) {
            if (opponentHand.length === 1) {
                opponentHand.push(randomCard(newPossibleCards));
                return randomGame(hand, opponentCount, table, opponents);
            }
        }

        if (opponentCount > 0) {
            return randomGame(hand, opponentCount - 1, table, [...opponents, [randomCard(newPossibleCards)]]);
        }
    } else if (opponentCount > 0) {
        const newPossibleOpponentHands = possibleOpponentHands.filter(opponentHand => !opponentHand.some(card => hand.includes(card) || table.includes(card) || opponents.some(hand => hand.includes(card))))
        if (newPossibleOpponentHands.length === 0) return 1;
        return randomGame(hand, opponentCount - 1, table, [...opponents, newPossibleOpponentHands[Math.floor(Math.random() * newPossibleOpponentHands.length)]], newPossibleOpponentHands);
    }

    if (table.length < 5) {
        return randomGame(hand, 0, [...table, randomCard(newPossibleCards)], opponents, possibleOpponentHands);
    }
    return isWinner(hand, opponents, table);
}

const randomCard = (deck) => deck[Math.floor(Math.random() * deck.length)];

const allGoodHands = (opponentCount, table = [], deadCards = [], prevGoodHands) => {
    const possibleCards = DECK.filter(card => !deadCards.includes(card) && !table.includes(card));
    const possibleHands = prevGoodHands || allHands(possibleCards, 2);
    return possibleHands.filter(hand => multiEstimated(hand, opponentCount, table, [], 5, 5).win[0] > 1 / (opponentCount + 1));
}

const generateRandom = (opponentCount, hand = [], table = [], opponents = []) => {
    const newPossibleCards = DECK.filter(card => !hand.includes(card) && !table.includes(card) && !opponents.some(hand => hand.includes(card)));

    if (hand.length < 2) {
        return generateRandom(opponentCount, [...hand, randomCard(newPossibleCards)], table, opponents);
    }

    for (const opponentHand of opponents) {
        if (opponentHand.length === 1) {
            opponentHand.push(randomCard(newPossibleCards));
            return generateRandom(opponentCount, hand, table, opponents);
        }
    }

    if (opponentCount > 0) {
        return generateRandom(opponentCount - 1, hand, table, [...opponents, [randomCard(newPossibleCards)]]);
    }

    if (table.length < 5) {
        return generateRandom(0, hand, [...table, randomCard(newPossibleCards)], opponents);
    }

    return [hand, table, opponents];
}

const runSampleGame = (opponentCount, money = 10) => {
    if (money <= 0) {
        console.log('You are out of money! You cannot play anymore!'.red);
        process.exit(1);
    }
    console.log('----------------New Game----------------'.magenta);
    console.log("You have " + `${money}`.yellow + " coins");
    const cardsDealt = generateRandom(opponentCount);

    const gameState = { yourHand: cardsDealt[0], visibleTable: [], table: cardsDealt[1], opponents: cardsDealt[2], pot: opponentCount + 1, amountIn: 1, money }

    if (playOneRound(gameState)) {
        setTimeout(() => runSampleGame(opponentCount, gameState.money), 1);
        return;
    }
    gameState.visibleTable = gameState.table.slice(0, 3);
    if (playOneRound(gameState)) {
        setTimeout(() => runSampleGame(opponentCount, gameState.money), 1);
        return;
    }
    gameState.visibleTable = gameState.table.slice(0, 4);
    if (playOneRound(gameState)) {
        setTimeout(() => runSampleGame(opponentCount, gameState.money), 1);
        return;
    }
    gameState.visibleTable = gameState.table;
    if (playOneRound(gameState)) {
        setTimeout(() => runSampleGame(opponentCount, gameState.money), 1);
        return;
    }

    console.log(`\nYour opponents: ${gameState.opponents.map(opponent => `${opponent}`.yellow).join(' ; ')}`);
    const amWinner = isWinner(gameState.yourHand, gameState.opponents, gameState.table);
    if (amWinner === 1) {
        console.log("You won!".bgGreen + ` +${gameState.pot - gameState.amountIn} coins`.yellow);
        gameState.money += gameState.pot;
    } else if (amWinner === 0) {
        console.log("You tied!".bgBlue);
        gameState.money += gameState.amountIn; // need to fix
    } else console.log("You lost!".bgRed + ` -${gameState.amountIn} coins`.yellow);

    setTimeout(() => runSampleGame(opponentCount, gameState.money - gameState.amountIn), 1);
}

const playOneRound = (gameState) => {
    console.log("\nThere are " + `${gameState.opponents.length}`.yellow + " opponents left");
    console.log("Your hand: " + `${gameState.yourHand}`.yellow);
    if (gameState.visibleTable.length > 0) console.log("Table: " + `${gameState.visibleTable}`.yellow)
    let probs = multiEstimated(gameState.yourHand, gameState.opponents.length, gameState.visibleTable, [], 10, 100, gameState.goodHands);

    // let name = readline.question("Play or pass? (y or n)");
    let name = 'y';
    if ((name.toLowerCase() === 'n') === (probs.win[0] < 1 / (gameState.opponents.length + 1))) console.log('Good choice!'.green);
    else console.log(("Eh, you probably should have " + (name.toLowerCase() === 'n' ? 'played' : 'passed')).red);
    console.log(`  Win: ${(100 * probs.win[0]).toFixed(2)}% ± ${(100 * probs.win[1]).toFixed(2)}%` + ` (Shooting for at least ${(100 / (gameState.opponents.length + 1)).toFixed(2)}%)`.grey);
    console.log(`  Tie: ${(100 * probs.tie[0]).toFixed(2)}% ± ${(100 * probs.tie[1]).toFixed(2)}%`);
    if (name.toLowerCase() === 'n') {
        console.log(` -${gameState.amountIn} coins`.yellow);
        gameState.money -= gameState.amountIn;
        return true;
    }

    gameState.goodHands = allGoodHands(gameState.opponents.length, gameState.visibleTable, gameState.yourHand, gameState.goodHands);

    let quitting = [];
    for (const [i, opponentHand] of gameState.opponents.entries()) {
        const opProbs = multiEstimated(opponentHand, gameState.opponents.length, gameState.visibleTable);
        if (opProbs.win[0] + opProbs.win[1] < 1 / (gameState.opponents.length + 1)) quitting.push(i);
    }
    gameState.opponents = gameState.opponents.filter((_, i) => !quitting.includes(i));
    if (gameState.opponents.length === 0) {
        console.log("Everyone else folded! You won!".bgGreen + ` +${gameState.pot - gameState.amountIn} coins`.yellow);
        gameState.money += gameState.pot - gameState.amountIn;
        return true;
    }

    gameState.pot += gameState.opponents.length + 1;
    gameState.amountIn += 1;
}

const SUITS = ['S', 'H', 'C', 'D'];
const VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 'T', 'J', 'Q', 'K', 'A'];

const DECK = SUITS.map(suit => VALUES.map(value => value + suit)).flat();
sortCards(DECK);




const nextTable = (visibleTable, realTable) => {
    if (visibleTable.length === 0) return realTable.slice(0, 3);
    if (visibleTable.length === 3) return realTable.slice(0, 4);
    if (visibleTable.length >= 4) return realTable;
}

const V = (gameState) => {
    // console.log(`V`, gameState);
    if (gameState.turn === undefined) {
        if (gameState.playerCount > 2) {
            gameState.turn = (gameState.dealer + 3) % gameState.playerCount;
        } else {
            gameState.turn = gameState.dealer;
        }
    }

    const { players, playerCount, turn, dealer, numSims, currentBet } = gameState;
    const [player, ...opponents] = players;

    if (gameState.new) {
        if (!gameState.visibleTable) gameState.visibleTable = [];
        player.agreedBet = -1;
        if (gameState.currentBet === undefined) {
            gameState.currentBet = gameState.visibleTable.length === 0 ? 2 : 0;
        }
        gameState.new = false;

        const possibleQs = [0, 0];
        for (let i = 0; i < numSims; i++) {
            const newDeck = shuffle(DECK.filter(card => !player.hand.includes(card) && !gameState.visibleTable.includes(card)));
            gameState.table = [...gameState.visibleTable, ...Array(5 - (gameState.visibleTable || []).length).fill().map(() => newDeck.pop())];
            gameState.players = [player, ...Array(playerCount - 1).fill().map((_, i) => {
                return { hand: [newDeck.pop(), newDeck.pop()], amountIn: 0, playing: true, agreedBet: -1 };
            })];
            if (gameState.visibleTable.length === 0) {
                if (playerCount > 2) {
                    gameState.players[(dealer + 1) % playerCount].agreedBet = 1;
                    gameState.players[(dealer + 2) % playerCount].agreedBet = 2;
                    for (let p = (dealer + 3) % playerCount; p !== 0; p = (p + 1) % playerCount) {
                        gameState.players[p].agreedBet = gameState.currentBet;
                    }
                } else {
                    gameState.players[dealer].agreedBet = 1;
                    gameState.players[1 - dealer].agreedBet = 2;
                    if (gameState.turn === 0) gameState.players[1 - gameState.turn].agreedBet = gameState.currentBet;
                }
            } else {
                for (let p = (dealer + 1) % playerCount; p !== 0; p = (p + 1) % playerCount) {
                    gameState.players[p].agreedBet = gameState.currentBet;
                }
            }

            if (gameState.currentBet > gameState.players[turn].agreedBet) {
                [-10000000, QCall(gameState)].forEach((q, i) => {
                    possibleQs[i] += q;
                });
            } else {
                [QCall(gameState), QRaise(gameState)].forEach((q, i) => {
                    possibleQs[i] += q;
                });
            }
        }
        // console.log(possibleQs.map(q => q / numSims));
        return (gameState.turn === 0 ? Math.max : Math.min)(...possibleQs.map(q => q / numSims));
    }


    if (!player.playing) return V({
        ...gameState,
        turn: (turn + 1) % playerCount
    });

    if (turn === 0 && opponents.every(opponent => !opponent.playing)) return getPot(gameState) - player.amountIn;

    if (currentBet === players[turn].agreedBet) return nextRound(gameState);

    if (currentBet > 0) {
        return (turn === 0 ? Math.max : Math.min)(QFold(gameState), QCall(gameState));
    }
    return (turn === 0 ? Math.max : Math.min)(QCall(gameState), QRaise(gameState));
}

const QFold = (gameState) => {
    // console.log('QFold', gameState);
    const { turn, players, playerCount } = gameState;
    if (turn === 0) {
        // console.log(-players[0].amountIn - Math.max(0, players[0].agreedBet));
        return -players[0].amountIn - Math.max(0, players[0].agreedBet);
    }
    return V({
        ...gameState,
        turn: (turn + 1) % playerCount,
        players: players.map((player, i) => {
            if (i === turn) return { ...player, playing: false };
            return player;
        })
    });
}

const QCall = (gameState) => {
    // console.log('QCall', gameState);
    const { turn, players, playerCount, currentBet } = gameState;
    return V({
        ...gameState,
        turn: (turn + 1) % playerCount,
        players: players.map((player, i) => {
            if (i === turn) return { ...player, agreedBet: currentBet };
            return player;
        })
    });
};

const QRaise = (gameState) => {
    // console.log('QRaise', gameState);
    const { turn, players, playerCount, currentBet } = gameState;
    return V({
        ...gameState,
        turn: (turn + 1) % playerCount,
        currentBet: Math.max(currentBet, 2),
        players: players.map((player, i) => {
            if (i === turn) return { ...player, agreedBet: Math.max(currentBet, 2) };
            return player;
        })
    });
};

const nextRound = (gameState) => {
    const { dealer, playerCount, players, visibleTable, table } = gameState;
    if (visibleTable.length < 5) {
        return V({
            ...gameState,
            currentBet: 0,
            turn: (dealer + 1) % playerCount,
            players: players.map(player => ({ ...player, amountIn: player.amountIn + Math.max(0, player.agreedBet), agreedBet: -1 })),
            visibleTable: nextTable(visibleTable, table),
        });
    }
    return endGame(gameState);
}

const endGame = (gameState) => {
    const { players, table } = gameState;
    const [player, ...opponents] = players;
    const myScore = scoreHand([...player.hand, ...table]);
    let tie = 1;
    for (const opponent of opponents) {
        if (!opponent.playing) continue;
        const oScore = scoreHand([...opponent.hand, ...table]);
        if (oScore > myScore) return -player.amountIn;
        if (oScore === myScore) tie += 1;
    }
    return (getPot(gameState) / tie) - player.amountIn;
}

const shuffle = (list) => {
    const newList = [...list];
    for (let i = 0; i < newList.length; i++) {
        const r = Math.floor(Math.random() * newList.length);
        [newList[i], newList[r]] = [newList[r], newList[i]];
    }
    return newList;
}

const getPot = (gameState) => gameState.players.reduce((p, c) => p + c.amountIn + Math.max(0, c.agreedBet), 0);


const uniqueHands = allUniqueHands(DECK, 2);

const runV = (hand) => V({ currentBet: 1000, numSims: 1000, dealer: 1, turn: 0, new: true, players: [{ hand, amountIn: 0, playing: true }], playerCount: 2 })

const reversedValues = [...VALUES].reverse();

for (const [i, value1] of reversedValues.entries()) {
    console.log(reversedValues.map((value2, j) =>
        runV([value1 + 'C', value2 + (i < j ? 'C' : 'D')])
    ).join(','));
}

// uniqueHands.map(hand => console.log(hand, V({ numSims: 1000, dealer: 1, turn: 0, new: true, players: [{ hand, amountIn: 0, playing: true }], playerCount: 2 })));

// console.log(V({ new: true, numSims: 1000, dealer: 0, turn: 0, players: [{ hand: ['AC', 'AS'], amountIn: 0, playing: true }], playerCount: 2 }));

