// const p = (n) => {
//     const allSets = o(n);
//     return Object.keys(allSets).reduce((p, key) => Math.min(p, size(allSets[key]) - 1), n);
// }

// const size = (set) => Object.keys(set).length;

// const oCache = {}
// const o = (n) => {
//     if (oCache[n]) return oCache[n];
//     const result = {};
//     if (n === 1) {
//         addToSet(result, makeSet(1));
//         oCache[n] = result;
//         return result;
//     }
//     for (let p = 1; p <= n / 2; p++) {
//         const q = n - p;
//         const op = o(p);
//         const oq = o(q);
//         for (let sp in op) {
//             for (let sq in oq) {
//                 const comb = union(op[sp], oq[sq]);
//                 addToSet(comb, n);
//                 addToSet(result, comb);
//             }
//         }
//     }
//     oCache[n] = result;
//     return result;
// }

// const union = (s1, s2) => {
//     const result = {};
//     for (let key in s1) {
//         result[key] = s1[key];
//     }
//     for (let key in s2) {
//         result[key] = s2[key];
//     }
//     return result;
// }

// const makeSet = (...objects) => {
//     const result = {}
//     for (let object of objects) {
//         result[hash(object)] = object;
//     }
//     return result;
// }

// const addToSet = (set, ...objects) => {
//     for (let object of objects) {
//         set[hash(object)] = object;
//     }
// }

// const hashSalt = Math.floor(Math.random() * 2147483648 * 2 - 2147483648);

// const hash = (obj) => strHash(objHash(obj));

// const strHash = (str) => {
//     let h = hashSalt;

//     for (let c = 0; c < str.length; c++) {
//         h = ((h << 5) + h) + str.charCodeAt(c); /* hash * 33 + c */
//     }

//     return h;
// }

// const objHash = (obj) => {
//     if (typeof obj !== 'object' || obj === null) return obj + '';
//     if (obj.length !== undefined) return '[' + obj.map(v => hash(v)).join(',') + ']';
//     return '{' + Object.keys(obj).map(v => hash(v) + ':' + hash(obj[v])).join(',') + '}';
// };

const factor = (n, m = 2) => {
    while (m * m <= n) {
        if (n % m === 0) return [m, ...factor(n / m, m)];
        return factor(n, m === 2 ? 3 : (m + 2));
    }
    return [n];
}

const isPrime = (n) => factor(n).length === 1; // not fast but wahtever

const p = (n) => {
    if (n === 1) return 0;
    if (isPrime(n)) return p(n - 1) + 1;
    return factor(n).reduce((q, c) => q + p(c), 0);
}

console.log(Array(100).fill().map((_, i) => p(i + 1)));

// console.log(p(25));

