const start = [
    [{ coeff: 1, powers: {} }]
]

const next = (prev) => {
    const n = []
    for (let i = 0; i <= 0; i++) {
        n.push(add(...multb(prev[i] || []), ...deriv(prev[i] || [])));
    }
    return n;
}

const multb = (value) => {
    return value.map(term => {
        const newPowers = {...term.powers };
        newPowers[0] = newPowers[0] + 1 || 1;
        return {...term, powers: newPowers };
    })
}

const deriv = (value) => {
    return value.map(term => {
        if (Object.keys(term.powers).length === 0) return [];
        return Object.keys(term.powers).map(power => {
            const newPowers = {...term.powers };
            newPowers[power] -= 1;
            if (!newPowers[power]) delete newPowers[power];
            newPowers[(power - 0) + 1] = newPowers[(power - 0) + 1] + 1 || 1;
            return { coeff: term.powers[power] * term.coeff, powers: newPowers };
        })
    }).flat();
}

const add = (...list) => list.reduce((p, c) => {
    for (const i in p) {
        const term = p[i];
        if (equalsPowers(term.powers, c.powers)) {
            p[i] = {...term, coeff: term.coeff + c.coeff };
            return p;
        }
    }
    return [...p, c];
}, []);

const equalsPowers = (a, b) => {
    const AKeys = Object.keys(a);
    if (AKeys.length !== Object.keys(b).length) return false;
    return AKeys.every(key => b[key] !== undefined && a[key] === b[key]);
}

const inspect = x => console.log(require('util').inspect(x, false, null, true));


let thisOne = start;
let i = 0;
let fact = 1;
while (thisOne[0].length <= 50) {
    console.log(i);
    inspect(thisOne[0].map(term => ({...term, coeff: fact / term.coeff })));
    i += 1;
    fact *= i;
    console.log("");
    thisOne = next(thisOne);
}