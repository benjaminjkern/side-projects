const cache = {};

const V = (sigma, s, n) => {
    if (s >= sigma) return 1;
    if (s === 0 || n === 0) return 0;
    const key = s + ',' + n;
    if (cache[key]) return cache[key];
    cache[key] = 0;
    for (let b = 1; b <= s; b++) {
        cache[key] = Math.max(cache[key], 0.6 * V(sigma, s + b, n - 1) + 0.4 * V(sigma, s - b, n - 1));
    }
    return cache[key];
}

const S = 128;

Array(S).fill().map((_, i) => console.log(V(S, i, 9)));