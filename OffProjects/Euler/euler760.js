const B = 1000000007;
const bitB = 2 ** Math.ceil(Math.log2(B));

const g = (m, n) => {
    let m2 = m;
    let n2 = n;
    let result = (m2 ^ n2) % B;
    result = (result + (m | n) % B) % B;
    result = (result + (m & n) % B) % B;
    return result;
}

const f = (n) => {
    let result = 0;
    for (let k = 0; k <= n; k++) {
        result = (result + g(k, n - k)) % B;
    }
    return result;
}

const G = (N) => {
    let result = 0;
    for (let n = 0; n <= N; n++) {
        result = (result + f(n)) % B;
    }
    return result;
}


const cache = {};
Array(1000).fill().map((_, i) => {
    const l = G(i);
    console.log(l.toString(2).padStart('100010011111100110101100100100'.length, '0').split("").join(','));
});