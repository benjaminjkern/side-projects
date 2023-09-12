const getIndex = (i, max) => (i + max) % max;

const f = (list) => {
    if (list.every((x) => x === 0)) return 1;
    return list.reduce((p, x, i) => {
        if (x !== 1) return p;
        const newList = list.map((y) => (y === 0 ? 0 : 1));
        newList[i] = 0;
        const prevIndex = getIndex(i - 1, newList.length);
        const nextIndex = getIndex(i + 1, newList.length);
        if (newList[prevIndex] === 1) newList[prevIndex] = -1;
        if (newList[nextIndex] === 1) newList[nextIndex] = -1;
        return p + f(newList);
    }, 0);
};

const g = (n) => Array(n).fill(1);

console.log(f(g(11)));
