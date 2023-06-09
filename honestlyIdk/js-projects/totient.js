const totient = (base, mod) => {
    let a = 1;
    const b = [];
    while (!b.includes(a)) {
        b.push(a);
        a = (a * base) % mod;
    }
    return [b.length - b.indexOf(a), b.indexOf(a)];
}

const count = (list) => {
    const counts = {};
    list.forEach(i => {
        if (!counts[i]) counts[i] = 1;
        else counts[i]++;
    });
    return counts;
}

// console.log(totient(2, 10000));
const NUM = 7;
console.log(Array(NUM).fill().map((_, i) => totient(i - 0, NUM)));
// const max = 4139;
// // const max = 10000;

// // for (const m of Array(max).fill(0).map((_, idx) => idx + 1)) {
// //     console.log(m + ": " + Object.keys(Array(m).fill(0)).map(i => totient(i, m)[0]));
// // }

// // console.log(Object.keys(Array(max).fill(0)).map(i => totient(i, max)));
// console.log(count(Object.keys(Array(max).fill(0)).map(i => totient(i, max)[0])));