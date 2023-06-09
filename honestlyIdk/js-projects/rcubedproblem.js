// r^3 = r^2 + 1
// r ~ 1.466

const r = 1.465;

const maxSetSize = 10;
const minDiff = 3;
const minExponent = -30;

const cachedValues = { 0: [0, 1, 0] }

const getRelativeValue = (exp) => {
    if (cachedValues[exp]) return cachedValues[exp];
    if (exp < 0) {
        const oneUp = getRelativeValue(exp + 1);
        cachedValues[exp] = [oneUp[1], oneUp[2] - oneUp[0], oneUp[0]];
        return cachedValues[exp];
    } else {
        const oneDown = getRelativeValue(exp - 1);
        cachedValues[exp] = [oneDown[2], oneDown[0], oneDown[1] + oneDown[2]];
        return cachedValues[exp];
    }
}

const getMaxExponent = (targetNum) => {
    let exp = 0;
    while (r ** exp <= targetNum) {
        exp++;
    }
    return exp - 1;
}

const evaluate = (value) => value[0] / r + value[1] + value[2] * r;

//breathFirst
const getExponentSet1 = (targetNum, startTime = new Date().getTime()) => {
    const frontier = [
        [
            [0, 0, 0],
            []
        ]
    ];
    while (frontier.length > 0) {
        if (new Date().getTime() - startTime > maxTime) throw "Timeout";

        const [currentValue, soFar] = frontier.shift();
        if (currentValue[0] === 0 && currentValue[2] === 0 && currentValue[1] === targetNum) return soFar;
        if (soFar.length >= maxSetSize || evaluate(currentValue) > targetNum) continue;

        let exponent = getMaxExponent(targetNum - evaluate(currentValue));

        while (exponent > minExponent) {
            if (soFar.every(exp => Math.abs(exp - exponent) >= minDiff)) {
                let newValue = getRelativeValue(exponent);
                frontier.push([currentValue.map((c, i) => c + newValue[i]), [...soFar, exponent]]);
            }
            exponent--;
        }
    }
    throw "Failed to find answer in search space";
}

//depthFirst
const getExponentSet2 = (targetNum, startTime = new Date().getTime(), currentValue = [0, 0, 0], soFar = []) => {
    if (new Date().getTime() - startTime > maxTime) throw "Timeout";

    if (currentValue[0] === 0 && currentValue[2] === 0 && currentValue[1] === targetNum) return soFar;
    if (soFar.length >= maxSetSize) throw "Can only get bigger from here";
    if (Math.floor(evaluate(currentValue)) > targetNum) throw "You're already bigger than the target";

    let exponent = getMaxExponent(targetNum - Math.floor(evaluate(currentValue)));
    while (exponent > minExponent) {
        // console.log(exponent);
        if (soFar.every(exp => Math.abs(exp - exponent) >= minDiff)) {
            try {
                let newValue = getRelativeValue(exponent);
                return getExponentSet2(targetNum, startTime, currentValue.map((c, i) => c + newValue[i]), [...soFar, exponent]);
            } catch (e) {
                if (e === "Timeout") throw e;
            }
        }

        exponent--;
    }

    throw "Failed to find answer in search space";
}

const exponentSetCache = {
    0: [],
    1: [0],
    2: [1, -2, -7],
    3: [2, -1, -5, -10],
    4: [3, -1, -5, -10],
    5: [4, -3, -7],
    6: [4, 0, -3, -7],
    7: [5, -4, -10],
    8: [5, 0, -4, -10],
    9: [5, 2, -7, -10],
    10: [6, -7, -10],
    11: [6, 0, -7, -10],
    12: [6, 1, -2, -5, -12, -17],
    13: [
        6, 2, -1, -4, -9, -12, -17
    ],
    14: [
        6, 3, -1, -4, -9, -12, -17
    ],
    15: [7, -2, -12, -17],
    16: [7, 1, -12, -17],
    17: [7, 2, -3, -12, -17],
    18: [7, 3, -3, -12, -17],
    19: [7, 3, 0, -3, -12, -17],
    20: [7, 4, -1, -5, -9, -17],
    21: [
        7, 4, 1, -3, -7, -12, -17
    ],
    22: [8, -1, -9, -17],
    23: [8, 1, -4, -9, -17],
    24: [8, 2, -2, -6, -17],
    25: [8, 3, -2, -6, -17],
    26: [8, 4, -6, -17],
    27: [8, 4, 0, -6, -17],
    28: [
        8, 4, 1, -2, -5, -10, -17
    ],
    29: [
        8, 5, -1, -4, -8, -13, -17
    ],
    30: [8, 5, 1, -2, -10, -17],
    31: [
        8, 5, 2, -1, -6, -10, -17
    ],
    32: [9, -1, -6, -10, -17],
    33: [9, 1, -3, -10, -17],
};

const maxTime = 100000;
Array(100).fill().forEach((_, num) => {
    if (exponentSetCache[num]) {
        console.log(num, ":", exponentSetCache[num], "(Cache)");
        return;
    }
    try {
        console.log(num, ":", getExponentSet2(num), "(Depth)");
    } catch (e1) {
        try {
            console.log(num, ":", getExponentSet1(num), "(Breadth)");
        } catch (e2) {
            console.log(e1, ",", e2);
        }
    }
})