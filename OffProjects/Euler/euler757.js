const isSneaky = (N) => {
    let m = Math.floor(Math.sqrt(N));
    let s = Number.MAX_VALUE;
    while (m >= 1) {
        if (N % m === 0) {
            const newS = m + N / m;
            if (newS - s === 1) return true;
            if ((m - 1) + N / (m - 1) > newS + 1) return false;
            s = newS;
        }
        m--;
    }
    return false;
};

const factor = (n, m = 2) => {
    if (m * m <= n) {
        if (n % m === 0) return [m, ...factor(n / m, m)];
        return factor(n, m === 2 ? 3 : (m + 2));
    }
    return [n];
}

let s = 0;
let max = 0;
let min = Number.MAX_VALUE;
for (let i = 8; i < 100; i += 4) {
    if (isSneaky(i)) {
        const f = factor(i);
        if (f.length > max) max = f.length;
        if (f.length < min) min = f.length;
        // console.log(i, f.map(a => (a + '').padStart(10, ' ')).join(','));
        s += 1;
    }
}

console.log(s);
console.log(max);
console.log(min);