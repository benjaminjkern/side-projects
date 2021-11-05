const f1 = (x) => { let a = x; for (let k = -x; k < x; k++) { a += k ** 3; } return a; };

const f2 = (x) => 1;

const generateInput = () => Math.random() * 10;

const RUNS = 100;
const VALUES = 100000;

const results = [];

for (let i = 0; i < RUNS; i++) {
    results.push([0, 0]);
    for (let j = 0; j < VALUES; j++) {
        const first = Math.random() > 0.5;
        const funcs = first ? [f1, f2] : [f2, f1];
        const input = generateInput();

        const now = new Date().getTime();
        funcs[0](input);
        const mid = new Date().getTime();
        funcs[1](input);
        const end = new Date().getTime();

        results[i] = first ? [results[i][0] + mid - now, results[i][1] + end - mid] : [results[i][0] + end - mid, results[i][1] + mid - now];
    }
}

let sum = 0, sumSquares = 0;
for (let i = 0; i < results.length; i++) {
    for (let j = 0; j < results.length; j++) {
        sum += results[i][0] / results[j][1];
        sumSquares += (results[i][0] / results[j][1]) ** 2;
    }
}

const avg = [sum / (results.length ** 2), Math.sqrt(sumSquares / (results.length ** 2) - (sum / (results.length ** 2)) ** 2)];

console.log(`T(f1) / T(f2) : ${avg[0].toFixed(2)} ± ${avg[1].toFixed(2)}`);
if (avg[0] === 1) console.log("  (They faired the exact same, in this test)");
else if (avg[0] < 1) console.log(`  (f1 is ${1 / avg[0]}x faster)`);
else console.log(`  (f2 is ${avg[0]}x faster)`);