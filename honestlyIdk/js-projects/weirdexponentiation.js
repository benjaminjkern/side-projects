const compMult = (a, ...rest) => {
    if (rest.length === 0) return a;
    const b = compMult(...rest);
    return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
};

const compExp = (a, b) => {
    const r = Math.sqrt(a[0] ** 2 + a[1] ** 2);
    const theta = Math.atan2(a[1], a[0]);
    const phi = b[1] * Math.log(r) + b[0] * theta;
    return compMult(
        [r ** b[0] * Math.exp(-b[1] * theta), 0],
        [Math.cos(phi), Math.sin(phi)]
    );
};

const E = (array, func) => {
    let value = [1, 0];
    while (array.length) {
        value = compExp(func(array.pop()), value);
    }
    return value;
};

const range = (N) =>
    Array(N)
        .fill()
        .map((_, i) => i + 1);

const findValues = (sequence, maxValue = 10000) => {
    let n = 1;
    const values = [];
    while (n <= maxValue) {
        const value = sequence(n);
        const foundIndex = values.findIndex((x) =>
            x.every((y, i) => y === value[i])
        );
        if (foundIndex >= 0 && n % 2 === 0) return values.splice(foundIndex);
        values.push(value);
        n += 1;
    }
    return values;
};

for (let j = -1; j <= 1; j += 0.001) {
    console.log(
        j,
        findValues((i) => E(range(i), (n) => compExp([j, 0], [n, 0])))
            .map((y) => y.join("+i"))
            .join(" ")
    );
}

// console.log(findValues((i) => E(range(i), (n) => compExp([-0.01, 0], [n, 0]))));

// console.log(compExp([-1, 0], [1 / 4, 0]));
