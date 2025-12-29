const rollSingleDice = () => Math.ceil(Math.random() * 6);
const rollDice = () => {
    const value = rollSingleDice() + rollSingleDice();
    if (DEBUG) console.log("Rolled", value);
    return value;
};

const MAX_ODDS = 5;
const TARGET_RATIO = 3;
const MIN_BUYIN = 25;
const SAVE_BUYIN = 0;

const DEBUG = false;

const playGame = (startMoney) => {
    if (DEBUG) console.log(startMoney);
    let buyin = Math.min(
        startMoney,
        // MIN_BUYIN
        Math.max(MIN_BUYIN, startMoney / (1 + MAX_ODDS))
    );
    let money = startMoney - buyin;

    if (DEBUG) console.log("Put", buyin, "on the table");
    const point = rollDice();

    if (point === 2 || point === 3 || point === 12) {
        if (DEBUG) console.log("You lose!");
        return money;
    }
    if (point === 7 || point === 11) {
        money += 2 * buyin;
        if (DEBUG) console.log("You win!");
        return money;
    }

    let odds =
        money > SAVE_BUYIN ? Math.min(money - SAVE_BUYIN, buyin * MAX_ODDS) : 0;
    money -= odds;

    if (DEBUG) console.log("Odds:", odds);

    let buy6 = 0;
    money > SAVE_BUYIN ? money - SAVE_BUYIN : 0;
    money -= buy6;

    if (DEBUG) console.log("buy6", buy6);

    while (true) {
        const roll = rollDice();
        if (roll === 7) {
            if (DEBUG) console.log("You lost!");
            return money;
        }
        if (roll === point) {
            if (DEBUG) console.log("You won!");
            money += 2 * buyin;
            if ([4, 10].includes(point)) {
                money += (odds * 9) / 3;
            } else if ([5, 9].includes(point)) {
                money += (odds * 10) / 4;
            } else if ([6, 8].includes(point)) {
                money += (odds * 11) / 5;
            }
            money += buy6;
            return money;
        }
        if ((point === 6 && roll === 8) || roll === 6) {
            buy6 += buy6 * (7 / 6);
            if (DEBUG) console.log("buy6", buy6);
        }
    }
};

const playUntilDone = (startBudget) => {
    let budget = startBudget;
    let count = 0;
    while (count <= 10) {
        budget = playGame(budget);
        if (budget <= 0) return 0;
        if (budget >= TARGET_RATIO * startBudget) return budget;
        count++;
        if (count % 10000 === 0) console.log(budget);
    }
    // console.log("Played", 10, "games");
    return budget;
};

const TOTAL_GAMES = 10000000;
let sum = 0;
for (let i = 0; i < TOTAL_GAMES; i++) {
    const value = playUntilDone(1000);
    sum += value;
}

console.log(sum / TOTAL_GAMES);

// playUntilDone(1000);
