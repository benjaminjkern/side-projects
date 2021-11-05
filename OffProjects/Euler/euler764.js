const f = (x, y, z) => 16 * x ** 2 + y ** 4 - z ** 2;

const factor = (n, m = 2) => {
    if (m * m <= n) {
        if (n % m === 0) return [m, ...factor(n / m, m)];
        return factor(n, m === 2 ? 3 : (m + 2));
    }
    return [n];
}

const makeBagFromList = (list) => list.reduce((p, c) => p[c] ? { ...p, [c]: p[c] + 1 } : { ...p, [c]: 1 }, {});

const primeBagToNum = (primeBag) => Object.keys(primeBag).reduce((p, c) => p * c ** primeBag[c], 1);

const bagIntersection = (a, ...bags) => {
    if (!bags.length) return a;

    const ALength = Object.keys(a).length;
    if (ALength === 0) return {};

    const b = bags.length > 1 ? bagIntersection(...bags) : bags[0];

    if (Object.keys(b).length < ALength) return bagIntersection(b, a);

    const c = {};
    Object.keys(a).forEach(key => {
        if (b[key]) c[key] = Math.min(a[key], b[key]);
    });

    return c;
}

const gcd = (...listOfNums) => {
    return primeBagToNum(bagIntersection(...listOfNums.map(num => makeBagFromList(factor(num)))));
}

const isGCD1 = (listOfNums) => gcd(...listOfNums) === 1;

const getAll = (N) => {
    const seen = {};
    const frontier = [[1, 1, 1]];
    const answers = [];
    while (frontier.length) {
        const top = frontier.pop();
        const key = top + '';
        if (seen[key] || top.some(a => a > N)) continue;
        seen[key] = true;
        const getF = f(...top);
        // console.log(top, getF);
        if (getF === 0 && isGCD1(top)) {
            answers.push(top);
        }
        if (getF > 0) {
            frontier.push([top[0], top[1], Math.ceil(Math.sqrt(16 * top[0] ** 2 + top[1] ** 4))]);
        }
        if (getF <= 0) {
            frontier.push([top[0] + 1, top[1], top[2]]);
            frontier.push([top[0], top[1] + 1, top[2]]);
        }
    }
    return answers;
}

console.log(getAll(10000).map(a => a.map(x => factor(x))));

// console.log(getAll(100).map(a => f(...a)));


