const I = (n) => {
    let m = 2;
    while (m <= n/2) {
        if ((m * m) % n === 1) return n - m;
        m += 1;
    }
    return 1;
}

// console.log(I(3));

let sum = 0;
for (let n = 3; n <= 20000000; n++) {
    sum += I(n);
}

console.log(sum);