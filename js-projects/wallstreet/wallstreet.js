require('colors');
const INTERVAL = 24 * 60;

const strategy = (time) => {


    // at every time step, pull out 10% of all currently owned stocks and put everything into the stock that did the worst percentage-wise
    stocks.forEach(stock => invest(stock, -stock.owned * stock.price));
    invest(stocks.reduce((p, stock) => ((stock.price - stock.lastprice) / stock.lastprice < (p.price - p.lastprice) / p.lastprice) ? stock : p, stocks[0]), bank);

    // at every time step, pull out 10% of all currently owned stocks and put everything into the stock that did the best percentage-wise
    // stocks.forEach(stock => invest(stock, -stock.owned * stock.price / 10));
    // invest(stocks.reduce((p, stock) => ((stock.price - stock.lastprice) / stock.lastprice > (p.price - p.lastprice) / p.lastprice) ? stock : p, stocks[0]), bank);


    // at every time step, pull out 10% of all currently owned stocks and put everything into the stock that did the best
    // stocks.forEach(stock => invest(stock, -stock.owned * stock.price / 10));
    // invest(stocks.reduce((p, stock) => (stock.price - stock.lastprice > p.price - p.lastprice) ? stock : p, stocks[0]), bank);

    // at every time step, pull out and put everything into the stock that did the best
    // stocks.forEach(stock => invest(stock, -stock.owned * stock.price));
    // invest(stocks.reduce((p, stock) => (stock.price - stock.lastprice > p.price - p.lastprice) ? stock : p, stocks[0]), bank);

    // at every time step, pull out and put everything into the stock that did the worst
    // stocks.forEach(stock => invest(stock, -stock.owned * stock.price));
    // invest(stocks.reduce((p, stock) => (stock.price - stock.lastprice < p.price - p.lastprice) ? stock : p, stocks[0]), bank);

    // at every time step, pull out and then put everything into the stock that is the lowest price
    // stocks.forEach(stock => invest(stock, -stock.owned * stock.price));
    // invest(stocks.reduce((p, stock) => stock.price < p.price ? stock : p, stocks[0]), bank);

    // put everything into the stock that is least volatile (PRETTY BAD)
    // invest(stocks.reduce((p, stock) => stock.volatility < p.volatility ? stock : p, stocks[0]), bank);

    // put everything into the stock that is the most volatile (PRETTY GOOD)
    // invest(stocks.reduce((p, stock) => stock.volatility > p.volatility ? stock : p, stocks[0]), bank);

    // put everything into the stock that is worth the least
    // invest(stocks.reduce((p, stock) => stock.price < p.price ? stock : p, stocks[0]), bank);

    // put everything into the stock that is worth the most
    // invest(stocks.reduce((p, stock) => stock.price > p.price ? stock : p, stocks[0]), bank);

    // put everything into one stock and wait out the game
    // invest(stocks[0], bank);

    // put everything equally into every stock and wait out the game
    // const investAmount = bank / stocks.length;
    // stocks.forEach(stock => invest(stock, investAmount));
}



const invest = (stock, investmentDollarAmount) => {
    if (Math.abs(investmentDollarAmount) >= 1 && investmentDollarAmount <= bank && -stock.owned * stock.price <= investmentDollarAmount) {
        bank -= investmentDollarAmount;
        stock.owned += investmentDollarAmount / stock.price;

        // console.log((investmentDollarAmount > 0 ? "Bought " : "Sold ") + "$" + Math.abs(investmentDollarAmount).toFixed(2) + " worth of " + stock.name);
        // console.log("Current net worth: $" + netWorth().toFixed(2));
    }
}

const netWorth = () => bank + stocks.reduce((p, c) => p + c.owned * c.price, 0);

const runSim = (numstocks, bankStart) => {
    stocks = Array(numstocks).fill().map(newStock);
    bank = bankStart;
    for (let t = 0; t < 365 * INTERVAL; t++) {
        if (t % INTERVAL === 0) {
            strategy(t / INTERVAL);
        }
        stocks.forEach(stock => {
            stock.lastprice = stock.price;
            stock.price = Math.exp(Math.log(stock.price) + (Math.random() * 2 - 1) * stock.volatility);
        });
    }
    // console.log(stocks.map(stock => stock.price * stock.owned));
    return netWorth();
}

const newStock = () => ({ owned: 0, name: Math.random().toString(36).substring(2, 5), price: Math.random() * 1000, volatility: Math.random() * 0.001 });

const NUMSTOCKS = 10;
const BANKSTART = 100;
const SIMS = 100;

let stocks;
let bank;

const sims = Array(SIMS).fill().map(() => runSim(NUMSTOCKS, BANKSTART) - BANKSTART);

const avg = (list) => list.reduce((p, c) => p + c, 0) / list.length;

const stdev = (list) => Math.sqrt(list.reduce((p, c) => p + c ** 2, 0) / list.length - avg(list) ** 2)

console.log("$" + avg(sims).toFixed(2) + " ± $" + stdev(sims).toFixed(2));
// console.log(stocks);