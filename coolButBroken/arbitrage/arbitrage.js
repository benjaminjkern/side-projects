const agents = Array(100)
    .fill()
    .map((_, id) => ({
        id,
        amountOwned: Math.floor(Math.random() * 100),
        sellingPrice: Math.random(),
        buyingPrice: Math.random(),
        bankAccount: Math.random() * 1000,
    }));

const calcAvg = () => {
    let sumSellingPrice = 0;
    let sumBuyingPrice = 0;
    for (const agent1 of agents) {
        sumSellingPrice += agent1.sellingPrice;
        sumBuyingPrice += agent1.buyingPrice;
    }
    console.log(
        "Average selling price:",
        sumSellingPrice / 100,
        "Average buying price:",
        sumBuyingPrice / 100
    );
};

let limitBuys = [];
let limitSells = [];

const tryBuy = (agent) => {
    const validLimitSells = limitSells.filter(
        ({ id, sellingPrice }) =>
            id !== agent.id && sellingPrice <= agent.buyingPrice
    );
    if (validLimitSells.length) {
        const bestPrice = validLimitSells.pop();
        limitSells = limitSells.filter(({ id }) => id !== bestPrice.id);
        agent.bankAccount -= bestPrice.sellingPrice;
        bestPrice.bankAccount += bestPrice.sellingPrice;
        agent.amountOwned += 1;
        bestPrice.amountOwned -= 1;
        console.log("Successful sale!");
        return;
    }
    limitBuys.push(agent);
    limitBuys.sort(({ buyingPrice: a }, { buyingPrice: b }) => b - a);
};

const trySell = (agent) => {
    const validLimitBuys = limitBuys.filter(
        ({ id, buyingPrice }) =>
            id !== agent.id && buyingPrice >= agent.sellingPrice
    );
    if (validLimitBuys.length) {
        const bestPrice = validLimitBuys.pop();
        limitSells = limitBuys.filter(({ id }) => id !== bestPrice.id);
        agent.bankAccount += bestPrice.buyingPrice;
        bestPrice.bankAccount -= bestPrice.buyingPrice;
        agent.amountOwned -= 1;
        bestPrice.amountOwned += 1;
        console.log("Successful sale!");
        return;
    }
    limitSells.push(agent);
    limitSells.sort(({ sellingPrice: a }, { sellingPrice: b }) => a - b);
};
calcAvg();
while (true) {
    if (Math.random() * 10000 < 1) calcAvg();
    const r = Math.floor(Math.random() * agents.length);
    const agent = agents[r];

    const canSell = agent.amountOwned >= 1;
    const canBuy = agent.bankAccount >= agent.buyingPrice;

    if (canBuy && canSell) {
        if (Math.random() > 0.5) tryBuy(agent);
        else trySell(agent);
        continue;
    }
    if (canBuy) tryBuy(agent);
    else if (canSell) trySell(agent);
}
