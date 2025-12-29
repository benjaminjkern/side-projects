const pullOutFirst = (list) => {};
const tournamentSort = (list, comp) => {
    if (list.length === 1)
        return [list[0], ...tournamentSort(pullOutFirst(list))];
    const newList = [];
    for (let i = 0; i < list.length / 2; i++) {
        const left = list[i * 2];
        const right = list[i * 2 + 1];
        if (right === undefined) {
            newList.push([left]);
            continue;
        }
        newList.push(comp(left, right) > 0 ? [left, right] : [right, left]);
    }
    return tournamentSort(newList, (a, b) => comp(a[0], b[0]));
};
