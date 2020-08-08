const ohmMap = {}

const ohm = (m, n, k) => {
    let key = `${m},${n},${k}`;
    if (ohmMap[key]) return ohmMap[key];
    if (m < n) {
        ohmMap[key] = 0;
        return ohmMap[key];
    }
    if (m > n * k) {
        ohmMap[key] = 0;
        return ohmMap[key];
    }
    if (n === 1) {
        ohmMap[key] = 1;
        return ohmMap[key];
    }
    ohmMap[key] = [...Array(k).keys()].map(j => ohm(j + m - k, n - 1, k)).reduce((x, y) => x + y, 0);
    return ohmMap[key];
}

const prob = (m, n, k) => ohm(m, n, k) / k ** n;

const N = 100;
const D = 6;

[...Array(N * (D - 1) + 1).keys()].forEach(p => {
    console.log(p + N + ':' + prob(p + N, N, D));
})