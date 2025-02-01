const arrayWith_Spread = (array, index, value) => [
    ...array.slice(0, index - 1),
    value,
    ...array.slice(index + 1),
];

const arrayWith_Map = (array, index, value) =>
    array.map((x, i) => (i === index ? value : x));

// This is the fastest
const arrayWith_Dupe = (array, index, value) => {
    const result = [...array];
    result[index] = value;
    return result;
};

const timeFunc = (f, inputGenerator, iterations = 10000) => {
    let sumTime = 0;
    for (let i = 0; i < iterations; i++) {
        const input = inputGenerator(i);

        const start = new Date();
        f(...input);

        const end = new Date();
        sumTime += end - start;
    }

    return sumTime / iterations;
};

const timeFuncAllAtOnce = (f, inputGenerator, iterations = 10000) => {
    const inputs = [];
    for (let i = 0; i < iterations; i++) {
        inputs.push(inputGenerator(i));
    }
    const start = new Date();
    for (let i = 0; i < iterations; i++) {
        f(...inputs[i]);
    }
    const end = new Date();

    return (end - start) / iterations;
};

const inputGenerator = () => [
    Array(10000)
        .fill()
        .map(() => Math.random()),
    Math.floor(Math.random() * 10000),
    Math.random(),
];

// // 0.0605, 0.0558, 0.0625, 0.0577
// console.log(timeFuncAllAtOnce(arrayWith_Spread, inputGenerator));

// // 0.0709, 0.0683, 0.0697, 0.069, 0.071, 0.0758, 0.0714, 0.0718, 0.0737
// console.log(timeFuncAllAtOnce(arrayWith_Map, inputGenerator));

// // 0.0165, 0.017, 0.0163, 0.0169, 0.0165, 0.0153
// console.log(timeFuncAllAtOnce(arrayWith_Dupe, inputGenerator));

const arrayWithout_Spread = (array, index) => [
    ...array.slice(0, index - 1),
    ...array.slice(index + 1),
];

const arrayWithout_Filter = (array, index) =>
    array.filter((x, i) => i !== index);

// This is the fastest
const arrayWithout_DupeSplice = (array, index) => {
    const result = [...array];
    result.splice(index, 1);
    return result;
};

// // 0.0587, 0.0597
// console.log(timeFuncAllAtOnce(arrayWithout_Spread, inputGenerator));

// // 0.0737, 0.0718
// console.log(timeFuncAllAtOnce(arrayWithout_Filter, inputGenerator));

// // 0.0188, 0.018
// console.log(timeFuncAllAtOnce(arrayWithout_DupeSplice, inputGenerator));

// Seems to be (marginally) the fastest but the other two do well with v8 caching
const arrayAnd_Spread = (array, value) => [...array, value];

const arrayAnd_arrayWith = (array, value) =>
    arrayWith_Dupe(array, array.length, value);

const arrayAnd_DupePush = (array, value) => {
    const result = [...array];
    result.push(value);
    return result;
};

// 0.0395, 0.0341, 0.0331
console.log(timeFuncAllAtOnce(arrayAnd_Spread, inputGenerator));

// 0.0308, 0.0375, 0.0393
console.log(timeFuncAllAtOnce(arrayAnd_arrayWith, inputGenerator));

// 0.0304, 0.0385, 0.0396
console.log(timeFuncAllAtOnce(arrayAnd_DupePush, inputGenerator));
