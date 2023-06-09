const newBrain = (inputKeys, numNeurons, range = 1) => {
    const neuronKeys = Array(numNeurons)
        .fill(1)
        .map(() => Math.random().toString(36).substring(2, 12));
    const allKeys = [...inputKeys, ...neuronKeys];
    return {
        ...neuronKeys.reduce(
            (p, c) => ({...p, [c]: newNeuron(allKeys, range) }), {}
        ),
        output: newNeuron(allKeys, range),
    };
};

const newNeuron = (possibleKeys, range) => {
    const xKey = possibleKeys[Math.floor(Math.random() * possibleKeys.length)];
    const yKey = possibleKeys[Math.floor(Math.random() * possibleKeys.length)];

    return {
        xKey,
        yKey,
        c: newRand(range),
        x: newRand(range),
        y: newRand(range),
        sx: newRand(range),
        sy: newRand(range),
        dx: newRand(range),
        dy: newRand(range),
        xy: newRand(range),
    };
};

const mutateBrain = (
    inputKeys,
    oldBrain,
    mutation,
    chanceChange,
    range = 1
) => {
    const { output, ...neurons } = oldBrain;
    const allKeys = [...inputKeys, ...Object.keys(neurons)];
    if (Math.random() <= chanceChange) {
        if (Math.random() > 0.5)
            delete neurons[Math.floor(Math.random() * Object.keys(neurons).length)];
        else {
            const newKey = Math.random().toString(36).substring(2, 12);
            neurons[newKey] = newNeuron([...allKeys, newKey], range);
        }
    }
    return {
        ...Object.keys(neurons).reduce(
            (p, c) => ({
                ...p,
                [c]: mutateNeuron(
                    neurons[c],
                    mutation,
                    chanceChange,
                    Object.keys(neurons)
                ),
            }), {}
        ),
        output: mutateNeuron(output, mutation, chanceChange, Object.keys(neurons)),
    };
};

const mutateNeuron = (oldNeuron, mutation, chanceChange, possibleKeys) => {
    const xKey =
        Math.random() > chanceChange ?
        oldNeuron.xKey :
        possibleKeys[Math.floor(Math.random() * possibleKeys.length)];
    const yKey =
        Math.random() > chanceChange ?
        oldNeuron.yKey :
        possibleKeys[Math.floor(Math.random() * possibleKeys.length)];

    return {
        xKey,
        yKey,
        c: oldNeuron.c + newRand(mutation),
        x: oldNeuron.x + newRand(mutation),
        y: oldNeuron.y + newRand(mutation),
        sx: oldNeuron.sx + newRand(mutation),
        sy: oldNeuron.sy + newRand(mutation),
        dx: oldNeuron.dx + newRand(mutation),
        dy: oldNeuron.dy + newRand(mutation),
        xy: oldNeuron.xy + newRand(mutation),
    };
};

const cleanBrain = (brain) => {
    putIn = ["output"];
    alreadyIn = {};
    while (putIn.length > 0) {
        top = putIn.pop();
        if (alreadyIn[top] || !brain[top]) continue;
        alreadyIn[top] = brain[top];
        putIn.push(brain[top].xKey);
        putIn.push(brain[top].yKey);
    }
    return alreadyIn;
};

const sgn = (a) => (a > 0 ? 1 : a === 0 ? 0 : -1);
const div = (a) => (a === 0 ? 0 : 1 / a);
const newRand = (range) => (Math.random() * 2 - 1) * range;

const passThrough = (allInputs, neuron) => {
    const xNeuron = allInputs[neuron.xKey];
    const yNeuron = allInputs[neuron.yKey];

    let value = (
        (neuron.c ? neuron.c : 0) +
        (neuron.x ? neuron.x : 0) * xNeuron +
        (neuron.y ? neuron.y : 0) * yNeuron +
        (neuron.sx ? neuron.sx : 0) * sgn(xNeuron) +
        (neuron.sy ? neuron.sy : 0) * sgn(yNeuron) +
        (neuron.dx ? neuron.dx : 0) * div(xNeuron) +
        (neuron.dy ? neuron.dy : 0) * div(yNeuron) +
        (neuron.xy ? neuron.xy : 0) * xNeuron * yNeuron
    );
    if ([Infinity, -Infinity, NaN].includes(value)) return 0;
    return value;
};

const calculate = (brain, inputs, maxStep) => {
    let brainState = {
        ...Object.keys(brain).reduce((p, c) => ({...p, [c]: 0 }), {}),
        ...inputs,
    };
    for (let step = 0; step < maxStep; step++) {
        let newBrainState = {};

        Object.keys(brain).forEach((neuronKey) => {
            newBrainState[neuronKey] = passThrough(brainState, brain[neuronKey]);
        });

        brainState = {...brainState, ...newBrainState };
    }
    return brainState.output;
};

const testPopulation = (
    brains,
    numTrials,
    numCalcs,
    targetFunction,
    inputKeys,
    range = [-1, 1]
) => {
    const brainErrors = Object.keys(brains).reduce(
        (p, c) => ({...p, [c]: 0 }), {}
    );

    Array(numTrials)
        .fill(1)
        .forEach(() => {
            const i = inputKeys.reduce((p, c) => ({...p, [c]: Math.random() * (range[1] - range[0]) + range[0] }), {});
            Object.keys(brains).forEach((brainKey) => {
                brainErrors[brainKey] +=
                    Math.abs(
                        calculate(brains[brainKey], i, numCalcs) - targetFunction(i)
                    ) / numTrials;
            });
        });
    console.log(brainErrors[getBest(brainErrors)]);
    return brainErrors;
};

const getBest = (scores) =>
    Object.keys(scores).reduce(
        (p, c) => (scores[c] < scores[p] ? c : p),
        Object.keys(scores)[0]
    );

const repopulate = (brains, scores, toKeepPercentage, inputKeys) => {
    const amountToKeep =
        Math.ceil(toKeepPercentage * Object.keys(brains).length) || 1;
    let keptSoFar = 0;
    let newBrains = {};
    let oldBrains = {...brains };
    let oldScores = {...scores };
    while (keptSoFar < amountToKeep) {
        bestBrain = getBest(oldScores);
        delete oldBrains[bestBrain];
        delete oldScores[bestBrain];
        newBrains[bestBrain] = brains[bestBrain];
        keptSoFar++;
    }
    // make a brand new brain
    newBrains[Math.random().toString(36).substring(2, 12)] = newBrain(
        inputKeys,
        1
    );
    keptSoFar++;
    // this is absurd
    while (keptSoFar < Object.keys(brains).length) {
        newBrains[Math.random().toString(36).substring(2, 12)] = mutateBrain(
            inputKeys,
            newBrains[
                Object.keys(newBrains)[
                    Math.floor(Math.random() * Object.keys(newBrains).length)
                ]
            ],
            0.1,
            0.1
        );
        keptSoFar++;
    }
    return newBrains;
};

const testFunc = ({ x }) => Number(x);

let brains = Array(10)
    .fill(1)
    .reduce(
        (p) => ({
            ...p,
            [Math.random().toString(36).substring(2, 12)]: newBrain(["x"], 1),
        }), {}
    );
let scores = {};

let a = 0;

while (
    (!Object.keys(scores).length || scores[getBest(scores)] > 0.001) &&
    a < 10000
) {
    scores = testPopulation(brains, 100, 10, testFunc, ['x'], [-3, 3]);
    brains = repopulate(brains, scores, 0.5, ['x']);
    a++;
}

const thebest = cleanBrain(brains[getBest(scores)]);
console.log(thebest);

const prompt = require("prompt-sync")();
while (true) {
    let x = prompt("Enter a number: ");
    if (x === "exit") break;
    let y = prompt("Enter a number: ");
    if (y === "exit") break;
    console.log("Network prediction: " + calculate(thebest, { x, y }, 10));
    console.log("Actual value: " + testFunc({ x, y }));
}