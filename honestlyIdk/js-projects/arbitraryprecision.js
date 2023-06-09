const colors = require('colors');

const PRECISION = 1000;
const RANGE = 100;
const BASE = 10;

const makeNum = (x) => {
    if (typeof x === 'object') {
        if (x.whole && x.decimal && x.negative !== undefined) return x;
        if (x.length !== undefined) return { whole: x, decimal: [], negative: false };
        console.log(x);
        throw "Incompatible";
    }
    if (typeof x === 'string') {
        const splitStrings = x.split('.');
        if (splitStrings.length > 2) throw "Has more than 2 decimal points!";

        const returnObject = {};
        if (splitStrings[0][0] === '-') {
            returnObject.negative = true;
            splitStrings[0] = splitStrings[0].slice(1);
        } else returnObject.negative = false;

        if (splitStrings[0].length === 0) returnObject.whole = [];
        else {
            if (isNaN(splitStrings[0] - 0)) throw "Not a number!";
            returnObject.whole = splitStrings[0].split('').reduce((p, c) => p.length === 0 && c === '0' ? [] : [...p, c - 0], []);
        }

        if (splitStrings.length === 1 || splitStrings[1].length === 0) returnObject.decimal = [];
        else {
            if (isNaN(splitStrings[1] - 0)) throw "Not a number!";
            returnObject.decimal = splitStrings[1].split('').map(digit => digit - 0);
        }

        while (returnObject.decimal.length > PRECISION || (returnObject.decimal.length > 0 && returnObject.decimal[returnObject.decimal.length - 1] === 0)) returnObject.decimal.pop();
        return returnObject;
    }
    if (typeof x === 'number')
        return { whole: (Math.floor(x) + '').split('').reduce((p, c) => p.length === 0 && c === '0' ? [] : [...p, c - 0], []), decimal: ((x % 1) + '').split('').slice(2).map(digit => digit - 0), negative: x < 0 }
}

const neg = (x) => {
    const X = makeNum(x);
    return {...X, negative: !X.negative };
}

const abs = (x) => {
    const X = makeNum(x);
    return {...X, negative: false };
}

const add = (a, b) => {
    const A = makeNum(a);
    const B = makeNum(b);
    if (A.negative && !B.negative) return sub(B, neg(A));
    if (!A.negative && B.negative) return sub(A, neg(B));

    const returnObject = { whole: [], decimal: [], negative: A.negative };
    let carry = 0;
    for (let i = Math.min(PRECISION, Math.max(A.decimal.length, B.decimal.length)) - 1; i >= 0; i--) {
        const ai = (A.decimal[i] - 0) || 0;
        const bi = (B.decimal[i] - 0) || 0;
        returnObject.decimal[i] = (ai + bi + carry) % 10;
        carry = Math.floor((ai + bi + carry) / 10);
    }

    for (let i = 0; i < Math.max(A.whole.length, B.whole.length); i++) {
        const ai = (A.whole[A.whole.length - 1 - i] - 0) || 0;
        const bi = (B.whole[B.whole.length - 1 - i] - 0) || 0;
        returnObject.whole[i] = (ai + bi + carry) % 10;
        carry = Math.floor((ai + bi + carry) / 10);
    }
    if (carry) returnObject.whole.push(carry);
    returnObject.whole = returnObject.whole.reverse().reduce((p, c) => p.length === 0 && c === 0 ? [] : [...p, c - 0], []);
    return returnObject;
}

const sub = (a, b) => {

    const A = makeNum(a);
    const B = makeNum(b);
    if (A.negative ^ B.negative === 1) return add(A, neg(B));
    if (A.negative && B.negative) return sub(neg(B), neg(A));
    if (greaterThan(B, A)) return neg(sub(B, A));

    const returnObject = { whole: [], decimal: [], negative: false };
    let carry = 0;
    for (let i = Math.min(PRECISION, Math.max(A.decimal.length, B.decimal.length)) - 1; i >= 0; i--) {
        const ai = (A.decimal[i] - 0) || 0;
        const bi = (B.decimal[i] - 0) || 0;
        returnObject.decimal[i] = (ai - bi + carry) % 10;
        if (returnObject.decimal[i] < 0) returnObject.decimal[i] += 10;
        carry = Math.floor((ai - bi + carry) / 10);
    }

    for (let i = 0; i < Math.max(A.whole.length, B.whole.length); i++) {
        const ai = (A.whole[A.whole.length - 1 - i] - 0) || 0;
        const bi = (B.whole[B.whole.length - 1 - i] - 0) || 0;
        returnObject.whole[i] = (ai - bi + carry) % 10;
        if (returnObject.whole[i] < 0) returnObject.whole[i] += 10;
        carry = Math.floor((ai - bi + carry) / 10);
    }
    if (carry) returnObject.whole.push(carry); //i dont think this is necessary
    returnObject.whole = returnObject.whole.reverse().reduce((p, c) => p.length === 0 && c === 0 ? [] : [...p, c - 0], []);
    return returnObject;

}

const mult = (a, b) => {
    const A = makeNum(a);
    const B = makeNum(b);

    const Along = [...A.whole, ...A.decimal];
    const Blong = [...B.whole, ...B.decimal];

    const result = Array(Along.length + Blong.length).fill(0);

    for (let i = 0; i < Along.length; i++) {
        for (let j = 0; j < Blong.length; j++) {
            result[i + j] += Along[Along.length - 1 - i] * Blong[Blong.length - 1 - j];
        }
    }

    result.forEach((value, i) => {
        if (value >= 10) {
            result[i + 1] += Math.floor(value / 10);
            result[i] = value % 10;
        }
    });
    result.reverse();
    const dec = result.slice(A.whole.length + B.whole.length);

    while (dec.length > PRECISION || (dec.length > 0 && dec[dec.length - 1] === 0)) dec.pop();

    return { negative: (A.negative ^ B.negative) === 1, whole: result.slice(0, A.whole.length + B.whole.length).reduce((p, c) => p.length === 0 && c === 0 ? [] : [...p, c - 0], []), decimal: dec }
}

const floor = (x) => {
    const X = makeNum(x);
    if (X.decimal.length === 0) return X;
    if (!X.negative) return {...X, decimal: [] };
    return neg(floor(add(neg(X), 1)));
}

const ceil = (x) => {
    const X = makeNum(x);
    if (X.negative) return {...X, decimal: [] };
    return neg(floor(neg(X)));
}

const round = (x) => {
    const X = makeNum(x);
    if (!X.negative) return floor(add(X, '0.5'));
    return neg(round(neg(X)))
}

const mult10 = (x) => {
    const X = makeNum(x);
    if (isZero(X)) return X;
    if (X.decimal.length === 0) { X.whole.push(0); return X; }
    X.whole.push(X.decimal[0]);
    X.decimal.shift();
    return X;
}

const div10 = (x) => {
    const X = makeNum(x);
    if (isZero(X)) return X;
    if (X.whole.length === 0) { X.decimal.unshift(0); return X; }
    X.decimal.unshift(X.whole[X.whole.length - 1]);
    X.whole.pop();
    return X;
}

const div = (a, b) => {
    let A = makeNum(a);
    let B = makeNum(b);
    if (isZero(B)) throw "Cannot divide by 0";
    while (B.decimal.length > 0 || A.decimal.length > 0) {
        B = mult10(B);
        A = mult10(A);
    }
    while (greaterThan) {

    }
    const cache = {}


    return B.negative ? neg(mult(A, Y)) : mult(A, Y);
}

const greaterThan = (a, b) => {
    const A = makeNum(a);
    const B = makeNum(b);
    if (A.negative && !B.negative) return false;
    if (!A.negative && B.negative) return true;

    if (A.whole.length > B.whole.length) return !A.negative;
    if (A.whole.length < B.whole.length) return A.negative;
    for (let i = 0; i < A.whole.length; i++) {
        if (A.whole[i] > B.whole[i]) return !A.negative;
        if (A.whole[i] < B.whole[i]) return A.negative;
    }
    for (let i = 0; i < A.decimal.length; i++) {
        if (B.decimal[i] === undefined || A.decimal[i] > B.decimal[i]) return !A.negative;
        if (A.decimal[i] < B.decimal[i]) return A.negative;
    }
    return A.negative;
}

const isZero = (x) => { const X = makeNum(x); return X.whole.length === 0 && X.decimal.length === 0; }

const equalTo = (a, b) => {
    const A = makeNum(a);
    const B = makeNum(b);
    return (isZero(A) && isZero(B)) || (A.whole.every((digit, i) => digit === B.whole[i]) && A.decimal.every((digit, i) => digit === B.decimal[i]) && A.negative === B.negative);
}

const lessThan = (a, b) => {
    return !equalTo(a, b) && !greaterThan(a, b);
}

const toString = (x) => {
    const X = makeNum(x);
    if (X.decimal.length === 0) {
        if (X.whole.length === 0) return '0';
        return (X.negative ? '-' : '') + X.whole.join('');
    }
    if (X.whole.length === 0) {
        return (X.negative ? '-' : '') + '0.' + X.decimal.join('');
    }
    return (X.negative ? '-' : '') + X.whole.join('') + '.' + X.decimal.join('');
}

const print = p => console.log(toString(p).yellow);

// console.log(sub('8', '12'))
print(round('-22.49'));