const leverages = [3, 2, -1, -2, -3];

const calculateVolatility = (priceArray) => {
    const apy =
        ((priceArray[priceArray.length - 1] - priceArray[0]) / priceArray[0]) **
        (APY_YEAR / (priceArray.length - 1));

    let prodShift = 1;
    for (let t = 1; t <= priceArray.length - 1; t++) {
        prodShift *=
            Math.abs(
                priceArray[t] /
                    priceArray[t - 1] /
                    (1 + apy) ** (1 / APY_YEAR) -
                    1
            ) + 1;
    }
    return 2 * (prodShift ** (1 / (priceArray.length - 1)) - 1);
};

const LENGTH = 365;

const APY_YEAR = 260;

const volatilities = [];

const runSim = (volatility, apy) => {
    const shifts = Array(LENGTH)
        .fill()
        .map(() => (Math.random() * 2 - 1) * volatility);
    const totalShift = shifts.reduce((p, c) => p * (1 + c), 1);
    let runningShift = 1;
    let lastPrice = 1;
    const levPrices = leverages.map(() => 1);
    const prices = [1];
    for (let t = 1; t <= LENGTH; t++) {
        runningShift *= 1 + shifts[t - 1];
        const price =
            ((1 + apy) ** (t / APY_YEAR) * runningShift) /
            totalShift ** (t / LENGTH);
        prices.push(price);
        levPrices.forEach((p, i) => {
            levPrices[i] =
                (((price - lastPrice) / lastPrice) * leverages[i] + 1) *
                levPrices[i];
        });
        lastPrice = price;
    }
    volatilities.push(calculateVolatility(prices));
    return levPrices.map(
        (finalPrice) => (finalPrice - 1) ** (APY_YEAR / LENGTH)
    ); // Return APY
};

const runMonteCarlo = (volatility, apy) => {
    const NUM_TO_RUN = 10000;
    let numRan = 0;
    const sums = leverages.map(() => 1);
    for (let i = 1; i <= NUM_TO_RUN; i++) {
        const results = runSim(volatility, apy);
        if (!results) continue;
        numRan++;
        sums.forEach((x, i) => {
            // if (results[i] > 1 || results[i] < -1) console.log(results);
            sums[i] = x + results[i];
        });
    }
    // console.log(
    //     apy,
    //     volatility,
    //     volatilities.reduce((p, c) => p + c, 0) / volatilities.length
    // );
    console.log(
        apy,
        volatility,
        sums.map((sum) => sum / numRan)
    );
};

// for (const apy of [0.05, 0.1, 0.2]) {
//     for (const volatility of [0.01, 0.02, 0.03, 0.04, 0.05]) {
//         runMonteCarlo(volatility, apy);
//         volatilities.splice(0);
//     }
// }
const fs = require("fs");

const data = fs
    .readFileSync(
        "honestlyIdk/OffProjects/HistoricalData_1765575525876.csv",
        "utf8"
    )
    .split("\n")
    .slice(1, -1)
    .map((line) => Number(line.split(",")[1]))
    .reverse();

console.log(calculateVolatility(data));
