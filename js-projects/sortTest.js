let comps;




const quickSort = (list) => {
    if (list.length === 0) return [];
    const tail = list.slice(1);
    let lessList = [];
    let sameList = [];
    let moreList = [];
    tail.forEach((item) => {
        if (item === list[0]) sameList.push(item);
        else if (item < list[0]) lessList.push(item);
        else moreList.push(item);
        comps++;
    });
    return [...quickSort(lessList), list[0], ...sameList, ...quickSort(moreList)];
};





const mergeSort = (list) => {
    if (list.length < 2) return list;
    const middle = Math.floor(list.length / 2);
    const firstHalf = mergeSort(list.slice(0, middle));
    const secondHalf = mergeSort(list.slice(middle));
    return merge(firstHalf, secondHalf);
};

const merge = (listA, listB) => {
    if (listA.length === 0) return listB;
    if (listB.length === 0) return listA;
    comps++;
    if (listA[0] < listB[0]) return [listA[0], ...merge(listA.slice(1), listB)];
    return [listB[0], ...merge(listA, listB.slice(1))];
};

const insertionSort = (list) => {
    if (list.length === 0) return [];
    let idx = 0;
    let minIdx = 0;
    while (idx < list.length) {
        if (list[idx] < list[minIdx]) minIdx = idx;
        comps++;
        idx++;
    }
    return [
        list[minIdx],
        ...insertionSort([...list.slice(0, minIdx), ...list.slice(minIdx + 1)]),
    ];
};

const tournamentSort = (list) => {
    // needs to be fixed so that its not as recursey
    if (list.length === 0) return [];
    if (list.length === 1)
        return [head(list[0]), ...tournamentSort(tail(list[0]))];
    if (compare(list[0], list[1]))
        return tournamentSort([...list.slice(2), [list[0], list[1]]]);
    return tournamentSort([...list.slice(2), [list[1], list[0]]]);
};

const head = (item) => {
    if (typeof item === "object") return head(item[0]);
    return item;
};

const tail = (item) => {
    if (typeof item === "object") return [...tail(item[0]), ...item.slice(1)];
    return [];
};

const compare = (a, b) => {
    if (typeof a === "object") return compare(a[0], b);
    if (typeof b === "object") return compare(a, b[0]);
    comps++;
    return a < b;
};

const parallelTournamentSort = (list) => {
    const stack = list.map((item) => ({
        value: item,
        greaterThan: [],
        equalTo: [],
    }));
    const returnList = [];
    while (returnList.length < list.length) {
        while (stack.length > 1) {
            stack.push(parallelCompare(stack.shift(), stack.shift()));
        }
        const top = stack.shift();
        returnList.push(...[top, ...top.equalTo].map((item) => item.value));
        stack.push(...top.greaterThan);
    }
    return returnList;
};

const parallelCompare = (a, b) => {
    if (a.value > b.value) {
        a.greaterThan.push(b);
        return a;
    } else if (a.value < b.value) {
        b.greaterThan.push(a);
        return b;
    }
    a.equalTo = [...a.equalTo, ...b.equalTo, b];
    a.greaterThan.push(...b.greaterThan);
    return a;
};

const countingSort = (list) => {
    let set = {};
    list.forEach((item) => {
        accesses++;
        if (!set[item]) set[item] = 1;
        else set[item]++;
    });
    return Object.keys(set).reduce(
        (p, c) => [...p, ...Array(set[c]).fill(Number(c))], []
    );
};

const shuffle = (list) => {
    let returnList = [...list];
    list.forEach((item, idx) => {
        let r = Math.floor(Math.random() * list.length);
        let t = returnList[idx];
        returnList[idx] = returnList[r];
        returnList[r] = t;
    });
    return returnList;
};

const shuffleList = shuffle([...Array(100000).keys()]);
// console.log(shuffleList);

// console.time("Marissa");
// console.log(insertionSort(shuffleList));
// console.timeEnd("Marissa");

console.time("Ben");
console.log(quickSort(shuffleList));
console.timeEnd("Ben");