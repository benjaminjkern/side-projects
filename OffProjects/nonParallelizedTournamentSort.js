const tournamentSort = (list, comp = (a, b) => a - b) => {
    while (list.length) {
        if (list.length === 1) return [getElem(list[0]), ...tournamentSort(getRest(list[0]), comp)];
        const value = comp(getElem(list[0]), getElem(list[1]));
        const match = value > 0 ? [list[0], list[1]] : [list[1], list[0]];
        list = [...list.slice(2), match];
    }
    return [];
}

const justNums = (list) => {
    if (list.value !== undefined) return list.value;
    return list.map(justNums);
}
const getElem = (item) => {
    if (item.length !== undefined) return getElem(item[0]);
    return item;
}

const getRest = (item) => {
    if (item.length !== undefined) return [...getRest(item[0]), ...item.slice(1)];
    return [];
}

const a = Array(1000).fill().map(() => ({ a: 0, b: 0, value: Math.floor(Math.random() * 10) }));
const b = [...a];

let comparisons = 0;
b.sort((x, y) => { comparisons++; x.a++; y.a++; return x.value - y.value; });
let sums = b.reduce((p, c) => [p[0] + c.a, p[1] + c.a ** 2], [0, 0]);
let avgs = [sums[0] / b.length, Math.sqrt(sums[1] / b.length - (sums[0] / b.length) ** 2)];

console.log(comparisons, avgs);

comparisons = 0;
const c = tournamentSort(a, (x, y) => { comparisons++; x.b++; y.b++; return x.value - y.value; });

sums = b.reduce((p, c) => [p[0] + c.b, p[1] + c.b ** 2], [0, 0]);
avgs = [sums[0] / b.length, Math.sqrt(sums[1] / b.length - (sums[0] / b.length) ** 2)];
console.log(comparisons, avgs);

// this can probably be improved upon