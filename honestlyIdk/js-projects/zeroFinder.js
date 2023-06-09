// find all real zeros of any polynomial
// a + bx + cx^2 + dx^3 + ex^4 + ...
const findZeros = (coefficients) => {
    if (coefficients.length === 1)
        return coefficients[0] === 0 ? ["All real numbers"] : [];
    if (coefficients[coefficients.length - 1] === 0)
        return findZeros(coefficients.slice(0, coefficients.length - 1));
    if (coefficients.length === 2) return [-coefficients[0] / coefficients[1]]; // linear
    if (coefficients.length === 3) {
        // probably don't actually need this section but it gives quicker and more accurate results
        let disc = coefficients[1] ** 2 - 4 * coefficients[0] * coefficients[2];
        if (disc < 0) return [];
        return [
            (-coefficients[1] + Math.sqrt(disc)) / (2 * coefficients[2]),
            (-coefficients[1] - Math.sqrt(disc)) / (2 * coefficients[2]),
        ];
    }
    if (coefficients.length % 2 === 1) {
        // power is even
        let criticalPointYValues = findZeros(derivative(coefficients)).map((x) =>
            fun(coefficients)(x)
        );
        // if all critical points are on the same side of zero as the limits to infinity, then there are no more zeros to be found
        if (
            criticalPointYValues.every(
                (y) => y > 0 === coefficients[coefficients.length - 1] > 0
            )
        )
            return [];
    }
    // an answer must exist from this point on, so we can use midpoint method
    let max = 10000;
    let min = -max;
    let lastX, testX;
    while (lastX === undefined || lastX !== testX + "") {
        lastX = testX + "";
        let maxY = fun(coefficients)(max);
        let minY = fun(coefficients)(min);
        testX = max - (maxY * (max - min)) / (maxY - minY);
        let y = fun(coefficients)(testX);
        console.log(y);
        if (y === 0) break;
        if (y > 0 == maxY > minY) max = testX;
        else min = testX;
    }
    return [testX, ...findZeros(divideBy(coefficients, testX))];
};

const derivative = (coefficients) => coefficients.map((c, i) => c * i).slice(1);

const fun = (coefficients) => (x) =>
    coefficients
    .slice()
    .reverse()
    .reduce((p, c, i) => p + c * x ** (coefficients.length - 1 - i), 0);

// note: if the last number is anything other than 0 (or -0) then the zero given was not properly a zero of the equation.
const divideBy = (coefficients, zero) =>
    zero === 0 ?
    coefficients.slice(1) :
    coefficients
    .reduce((p, c, i) => [...p, (p[i] - c) / zero], [0])
    .slice(1, coefficients.length);

// This is pretty stinkin fast now, I like it
const LENGTH = 8;
const NUM = 10000;
const LISTS = new Array(NUM)
    .fill(0)
    .map((_) => new Array(LENGTH).fill(0).map((_) => Math.random()));

console.log(findZeros([75.22, -48.28, 9.23, -0.84]));