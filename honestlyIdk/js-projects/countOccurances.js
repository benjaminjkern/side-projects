// a,=n array
// count occurances
// of any time two numbers add up to another

const countOccurances = (array) => {
    let numOccurances = 0;
    array.forEach((value1, idx) => {
        array.slice(idx + 1).forEach((value2) => {
            if (value1 === 0 || value2 === 0) return;
            numOccurances += array.filter(v => v === value1 + value2).length;
        });
    });
    return numOccurances;
}

console.log(countOccurances([2, 5, 7])); // 1
console.log(countOccurances([2, 5, 7, 7])); // 2
console.log(countOccurances([2, 5, 7, 12])); // 2
console.log(countOccurances([8, 3, 5, 4, 4])); // 2
console.log(countOccurances([2, 5, 7, 12, 9])); // 3

console.log(countOccurances([0, 1])); // 0
console.log(countOccurances([2, 2, 4])); // 1
console.log(countOccurances([2, 9, 10, 12, 6, 8, 15, 27, 20])); // 6