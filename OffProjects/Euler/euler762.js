const hash = (amoebaArray) => {
    if (!amoebaArray.length) return 0;
    const m = make16(amoebaArray[0]);
    if (m === 0) return hash(amoebaArray.slice(1));
    return m + 16 * hash(amoebaArray.slice(1));
}

const make16 = (cells) => {
    if (typeof cells !== 'object') return cells;
    if (!cells.length) return 0;
    return cells[0] + 2 * make16(cells.slice(1));
}

console.log(hash([15]));