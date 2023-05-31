const compMult = (a, b) => {
    if (typeof a === "number") return compMult([a, 0], b);
    if (typeof b === "number") return compMult(a, [b, 0]);
    return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
};
const compAdd = (a, b) => {
    if (typeof a === "number") return compAdd([a, 0], b);
    if (typeof b === "number") return compAdd(a, [b, 0]);
    return [a[0] + b[0], a[1] + b[1]];
};
const compSub = (a, b) => {
    if (typeof a === "number") return compSub([a, 0], b);
    if (typeof b === "number") return compSub(a, [b, 0]);
    return [a[0] - b[0], a[1] - b[1]];
};

const compExp = (x) => {
    if (typeof x === "number") return compExp([x, 0]);
    return [Math.cos(x[0]), Math.sin(x[1])];
};

const addList = (x, y) => x.map((a, i) => compAdd(a, y[i]));

const subList = (x, y) => x.map((a, i) => compSub(a, y[i]));

const fft = (x) => {
    if (x.length <= 1) return x;
    const e = fft(x.filter((_, i) => i % 2 === 0));
    const o = fft(x.filter((_, i) => i % 2 === 1));
    const u = x
        .slice(x.length / 2)
        .map((y) => compExp(compMult((y * -2 * Math.PI) / x.length, [0, 1])));
    const t = o.map((y, i) => compMult(y, u[i]));
    return [...addList(e, t), ...subList(e, t)];
};

console.log(fft([1, 1, 1, 1, 1, 1, 1, 1]));
