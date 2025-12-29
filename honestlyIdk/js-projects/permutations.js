const t = {};
const s = (n, m) => {
    const key = `${n},${m}`;
    if (t[key]) return t[key];
    if (n === m) return 1;
    if (n > m) return 0;
    if (n === 0) return 0;
    t[key] = s(n - 1, m - 1) + (m - 1) * s(n, m - 1);
    return t[key];
};

const a = {};

const f = (n) => {
    if (a[n]) return a[n];
    if (n <= 1) return 1;
    a[n] = n * f(n - 1);
    return a[n];
};

const q = (n) => {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += (i * s(i, n)) / f(n);
    }

    return sum;
};

for (let n = 0; n <= 500; n++) {
    console.log(q(n));
}

// Given a random permutation of N numbered items, what is the expected number of distinct loops that arise from following the number to the index repeatedly?
// Partial empirical answer: As N tends to infinity, ~log_2.5(N)
// Ways to make this better: Come up with a defined formula for s instead of a recursive one; factor out the factorial inside of s so that the value never gets too big to manage
