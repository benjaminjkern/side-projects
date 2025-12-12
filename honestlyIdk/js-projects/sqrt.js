const SQRT_2 = Math.sqrt(2);

const taylorSeries = (x) => {
    let n = 0;
    let s = 0;
    let a = x >= 1.5 ? 2 : 1;
    let r = x >= 1.5 ? SQRT_2 : 1;

    let lastS = NaN;
    while (true) {
        s += r;
        n += 1;
        r *= -((2 * n - 3) / 2 / n / a) * (x - a);

        if (s === lastS) break;
        lastS = s;
    }
    return { steps: n, result: s };
};

const newton = (x) => {
    let n = 0;
    let y = 1;
    const seen = {};
    while (true) {
        const diff = -(y * y - x) / 2 / y;
        y += diff;
        if (seen[y]) break;
        seen[y] = true;
        n += 1;
    }
    return { steps: n, result: y };
};

let sum = 0;

for (let i = 0; i < 1000; i++) {
    const { steps: sN } = newton(1 + i / 1000, 1);
    const { steps: sT } = taylorSeries(1 + i / 1000, 1);
    sum += sT / sN;
}
console.log(sum / 1000);
