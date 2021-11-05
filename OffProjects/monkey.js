const find = (a, b, c) => {
    let pa = 0;
    let pb = 0;
    while (true) {
        const sum = a * pa - b * pb;
        if (sum === c) return [pa, pb];
        if (sum > c) {
            pa -= 1;
        } else {
            pb -= 1;
        }
    }
}

console.log(find(4 ** 5, 5 ** 6, 8404));