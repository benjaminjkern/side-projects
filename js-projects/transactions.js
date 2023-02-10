const ACCOUNTS = {}

const transaction = (account1, account2, amount) => {
    if (amount <= 0) return;

    if (amount > ACCOUNTS[account1]) return;
    ACCOUNTS[account1] -= amount;
    ACCOUNTS[account2] += amount;
}

const AMOUNT = 100;
Array(100).fill().forEach(_ => ACCOUNTS[((Math.random() + '').slice(2) - 0).toString(36)] = AMOUNT);

const ACCOUNTNAMES = Object.keys(ACCOUNTS);
console.log(ACCOUNTNAMES.reduce((p, c) => p + ACCOUNTS[c], 0));

Array(10000).fill().forEach(_ => transaction(ACCOUNTNAMES[Math.floor(Math.random() * ACCOUNTNAMES.length)], ACCOUNTNAMES[Math.floor(Math.random() * ACCOUNTNAMES.length)], Math.random() * 100));
console.log(ACCOUNTNAMES.reduce((p, c) => p + ACCOUNTS[c], 0));