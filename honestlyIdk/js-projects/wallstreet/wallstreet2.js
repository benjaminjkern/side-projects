const fs = require('fs');

const getPrices = filename => fs.readFileSync(filename, 'utf-8').split('\n').slice(1, -1).map(line => +line.split(',')[1].split('$')[1]);


const newStrategy = (lookback = LOOKBACK) => {
    return {
        a: rand(),
        b: Array(lookback).fill().map(rand),
    }
}

const sum = (list, func = x => x) => list.reduce((p, c) => p + func(c), 0);

const rand = () => START_BUDGET * (Math.random() * 2 - 1);

const testStrategy = (strategy, pricesList, budget = START_BUDGET, debug = false) => {
    let spendingPower = budget;
    const lookback = strategy.b.length;
    let amountIn = pricesList.map(() => 0);
    const startSpot = Math.max(...pricesList.map(prices => prices.length)) - lookback;
    for (let t = startSpot; t >= 0; t--) {
        if (debug || Number.isNaN(spendingPower + sum(amountIn))) console.log(spendingPower, amountIn, spendingPower + sum(amountIn));
        const buyAmounts = pricesList.map((prices, pid) => {
            if (t + lookback > prices.length) return 0;
            const buyAmount = Math.max(-amountIn[pid], prices.slice(t, t + lookback).reduce((p, c, i) => p + c * strategy.b[i], strategy.a));
            if (buyAmount < 0) {
                spendingPower -= buyAmount;
                amountIn[pid] += buyAmount;
                return 0;
            }
            return buyAmount;
        });

        let totalBuyAmount = sum(buyAmounts);
        if (totalBuyAmount > spendingPower) {
            buyAmounts.forEach((b, i) => buyAmounts[i] = b / totalBuyAmount * spendingPower);
            totalBuyAmount = spendingPower;
        }
        spendingPower -= totalBuyAmount;
        buyAmounts.forEach((b, i) => {
            amountIn[i] += b;
            if (t > 0 && t + lookback <= pricesList[i].length) amountIn[i] *= pricesList[i][t - 1] / pricesList[i][t];
        });
        // for (let i = 0; i < 1000000000; i++) { }
    }
    // APR
    const APR = ((spendingPower + sum(amountIn)) / budget) ** (260 / startSpot);
    return APR;

    // const maxAPR = pricesList.map(prices => (prices[0] / prices[prices.length - 1]) ** (260 / (prices.length - lookback))).reduce((p, c) => p * c, 1);
    // return APR / (maxAPR ** (1 / pricesList.length));
}
const START_BUDGET = 1;
const LOOKBACK = 20;

const trainingPrices = fs.readdirSync('./training/').filter(a => a.endsWith('csv')).map(filename => getPrices('./training/' + filename));
const testingPrices = fs.readdirSync('./testing/').filter(a => a.endsWith('csv')).map(filename => getPrices('./testing/' + filename));

// console.log(fs.readdirSync('./testing/'));

const findBestStrat = () => {
    let best = newStrategy();
    let score = testStrategy(best, trainingPrices);

    let best2 = best;
    let score2 = testStrategy(best, testingPrices);

    let t = 0;

    let avg = 0;

    console.log(best, score, score2);
    while (t++ < 100000) {
        const newStrat = newStrategy();
        const newScore = testStrategy(newStrat, trainingPrices);

        avg = (newScore + avg * (t - 1)) / t;
        if (newScore > score) {
            best = newStrat;
            score = newScore;
            const newScore2 = testStrategy(newStrat, testingPrices);
            console.log(newStrat, newScore, newScore2);
            if (newScore2 > score2) {
                best2 = newStrat;
                score2 = newScore2;
                console.log("OOGABOOGA");
            }
        }
    }
    console.log(avg);
}

findBestStrat();

const goodStrats = [];