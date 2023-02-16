const bet = 1;

const newScore = (A, B, outcome) => {
    if (outcome === 1) console.log("A won");
    else console.log("B won");

    return [
        Math.max(A + bet * (outcome / P(A, B) - 1), 0),
        Math.max(B + bet * ((1 - outcome) / P(B, A) - 1), 0),
    ];
};

const P = (A, B) => (A + 1) / (A + B + 2);
let a = 0;
let b = 10;

for (let i = 0; i < 100; i++) {
    [a, b] = newScore(a, b, 1);
    console.log(a, b);
}