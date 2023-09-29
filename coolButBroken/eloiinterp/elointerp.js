const { Matrix, solve } = require("ml-matrix");

const A = new Matrix([
    [1, -1, 0, 0, 0],
    [1, 0, -1, 0, 0],
    [1, 0, 0, -1, 0],
    [1, 0, 0, 0, -1],
    [0, 1, -1, 0, 0],
    [0, 1, 0, -1, 0],
    [0, 1, 0, 0, -1],
    [0, 0, 1, -1, 0],
    [0, 0, 1, 0, -1],
    [0, 0, 0, 1, -1],
    [1, 1, 1, 1, 1],
]);
const f = (p) => -400 * Math.log10(1 / p - 1);

const Y = Matrix.columnVector([
    f(11 / 18),
    f(1 / 3),
    f(4 / 7),
    f(4 / 5),
    f(1 / 2),
    f(1 / 5),
    f(1 / 2),
    f(1 / 2),
    f(1 / 2),
    f(7 / 8),
    5000,
]);
const X = solve(A, Y);
console.log(X);
const Z = A.mmul(X);
const r = Z.transpose().mmul(Y).get(0, 0) / Z.norm() / Y.norm();
console.log(r * r);
