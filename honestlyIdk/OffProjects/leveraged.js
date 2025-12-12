const leverages = [3, 2, -1, -2, -3];

// TODO: Redo volatility calculation to be relative to current price instead of absolute difference

const LENGTH = 365;

const APY_YEAR = 260;

const runSim = (volatility, apy) => {
    const shifts = Array(LENGTH)
        .fill()
        .map(() => (Math.random() * 2 - 1) * volatility);
    const totalShift = shifts.reduce((p, c) => p + c);
    let runningShift = 0;
    let lastPrice = 1;
    const levPrices = leverages.map(() => 1);
    const prices = [1];
    for (let t = 1; t <= LENGTH; t++) {
        runningShift += shifts[t - 1];
        const price =
            (1 + apy) ** (t / APY_YEAR) +
            runningShift -
            (totalShift * t) / LENGTH;
        prices.push(price);
        levPrices.forEach((p, i) => {
            levPrices[i] =
                (((price - lastPrice) / lastPrice) * leverages[i] + 1) *
                levPrices[i];
        });
        lastPrice = price;
    }
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
    console.log(
        apy,
        volatility,
        sums.map((sum) => sum / numRan)
    );
};

const calculateVolatility = (priceArray) => {
    const apy =
        ((priceArray[priceArray.length - 1] - priceArray[0]) / priceArray[0]) **
        (APY_YEAR / (priceArray.length - 1));

    let sumShift = 0;
    for (let t = 1; t <= priceArray.length - 1; t++) {
        sumShift += Math.abs(
            priceArray[t] - priceArray[0] * (1 + apy) ** (t / APY_YEAR)
        );
    }
    return (
        (2 * sumShift) /
        (priceArray.length - 1) /
        Math.sqrt(priceArray.length - 1) /
        0.3648396355 // Idk where this comes from this was calculated over millions of iterations
    );
};

const fs = require("fs");

const data = fs
    .readFileSync(
        "honestlyIdk/OffProjects/HistoricalData_1765575525876.csv",
        "utf8"
    )
    .split("\n")
    .slice(1, -1)
    .map((line) => Number(line.split(",")[1]))
    .reverse()
    .slice(0, 365);

console.log(calculateVolatility(data));
