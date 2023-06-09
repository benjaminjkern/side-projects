const findFraction = (num, epsilon = 0.01) => {
    let denominator = 1;
    while (Math.abs(Math.round(num * denominator) / denominator - num) > epsilon)
        denominator++;
    return Math.round(num * denominator) + "/" + denominator;
};

const n = Math.cos(Math.PI / 8);
console.log(n);
console.log(findFraction(n));
console.log(3 / 8);