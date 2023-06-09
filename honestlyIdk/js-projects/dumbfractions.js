const numToArray = (n, base = 10) => n < 1 ? [] : [...numToArray(Math.floor(n / base)), n % base];

const arrayToNum = (arr, base = 10) => arr.length === 0 ? 0 : arrayToNum(arr.slice(0, -1)) * base + arr[arr.length - 1];

const getExamples = MAX => {
    const examples = [];

    for (let i = 1; i <= MAX; i++) {
        if (i % 10 === 0) continue;
        for (let j = 1; j < i; j++) {
            if (j % 10 === 0) continue;
            const fullI = numToArray(i);
            const fullJ = numToArray(j);
            for (let [kidx, k] of fullI.entries()) {
                if (k === 0 || fullI[kidx - 1] === k) continue;
                for (let [lidx, l] of fullJ.entries()) {
                    if (l === 0 || k !== l || lidx < kidx || fullJ[lidx - 1] === l) continue;
                    const newI = arrayToNum([...fullI.slice(0, kidx), ...fullI.slice(kidx + 1)]);
                    const newJ = arrayToNum([...fullJ.slice(0, lidx), ...fullJ.slice(lidx + 1)]);
                    if (newJ === 0) continue;
                    if (i / j === newI / newJ) examples.push([i, j, newI, newJ]);
                }
            }
        }
    }

    return examples;
}

for (let example of getExamples(10000)) {
    console.log(example[0] + ' / ' + example[1] + ' = ' + example[2] + ' / ' + example[3]);
}