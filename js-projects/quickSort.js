// [8, 100, 5, 0, 1, 90, 0]
// 11/18/20
// Ben Kern

const quickSort = (array) => {
    if (array.length === 0) return array;

    let lessThan = [];
    let greaterThan = [];

    for (let a of array.slice(1)) {
        if (a < array[0]) {
            lessThan.push(a);
        } else if (a > array[0]) {
            greaterThan.push(a);
        }
    }

    return [
        ...quickSort(lessThan),
        array[0],
        ...quickSort(greaterThan),
    ];
};

console.log(quickSort([]));
console.log(quickSort([8]));
console.log(quickSort([100, 8]));
console.log(quickSort([8, 100, 5, 0, 1, 90, 0]));