const IOSIZE = 16;
const INSTRUCTIONS = 32;
const DATASIZE = 32;

const OPERATIONS = {
    add: {
        run:
            ([x, y, p]) =>
            (brain) => {
                brain.data[p] = brain.data[x] + brain.data[y];
            },
        argSizes: [DATASIZE, DATASIZE, DATASIZE],
    },
    sub: {
        run:
            ([x, y, p]) =>
            (brain) => {
                brain.data[p] = brain.data[x] - brain.data[y];
            },
        argSizes: [DATASIZE, DATASIZE, DATASIZE],
    },
    mult: {
        run:
            ([x, y, p]) =>
            (brain) => {
                brain.data[p] = brain.data[x] * brain.data[y];
            },
        argSizes: [DATASIZE, DATASIZE, DATASIZE],
    },
    div: {
        run:
            ([x, y, p]) =>
            (brain) => {
                brain.data[p] = brain.data[x] / brain.data[y];
            },
        argSizes: [DATASIZE, DATASIZE, DATASIZE],
    },
    min: {
        run:
            ([x, y, p]) =>
            (brain) => {
                brain.data[p] = Math.min(brain.data[x], brain.data[y]);
            },
        argSizes: [DATASIZE, DATASIZE, DATASIZE],
    },
    max: {
        run:
            ([x, y, p]) =>
            (brain) => {
                brain.data[p] = Math.max(brain.data[x], brain.data[y]);
            },
        argSizes: [DATASIZE, DATASIZE, DATASIZE],
    },
    neg: {
        run:
            ([x, p]) =>
            (brain) => {
                brain.data[p] = -brain.data[x];
            },
        argSizes: [DATASIZE, DATASIZE],
    },
    jump: {
        run:
            ([i]) =>
            (brain) => {
                brain.instructionPointer = i - 1;
            },
        argSizes: [INSTRUCTIONS],
    },
    jgz: {
        run:
            ([x, i]) =>
            (brain) => {
                if (brain.data[x] >= 0) brain.instructionPointer = i - 1;
            },
        argSizes: [DATASIZE, INSTRUCTIONS],
    },
    move: {
        run:
            ([x, y]) =>
            (brain) => {
                brain.data[y] = brain.data[x];
            },
        argSizes: [DATASIZE, DATASIZE],
    },
    readInput: {
        run:
            ([q, p]) =>
            (brain) => {
                brain.data[p] = brain.inputData[q];
            },
        argSizes: [IOSIZE, DATASIZE],
    },
    readOutput: {
        run:
            ([q, p]) =>
            (brain) => {
                brain.data[p] = brain.outputData[q];
            },
        argSizes: [IOSIZE, DATASIZE],
    },
    writeOutput: {
        run:
            ([p, q]) =>
            (brain) => {
                brain.outputData[q] = brain.data[p];
            },
        argSizes: [DATASIZE, IOSIZE],
    },
    // print: {
    //     run:
    //         ([x]) =>
    //         (brain) => {
    //             console.log(brain.data[x]);
    //         },
    //     argSizes: [DATASIZE],
    // },
};

const randomGaussian = () => {
    return (Math.random() > 0.5 ? 1 : -1) * Math.sqrt(-Math.log(Math.random()));
};

const randomInstruction = () => {
    const opNames = Object.keys(OPERATIONS);
    const opName = opNames[Math.floor(Math.random() * opNames.length)];
    const operation = OPERATIONS[opName];

    const args = operation.argSizes.map((size) =>
        Math.floor(Math.random() * size)
    );

    return { run: operation.run(args), opName, args };
};

const newBrain = () => ({
    instructions: Array(INSTRUCTIONS).fill().map(randomInstruction),
    startData: Array(DATASIZE).fill().map(randomGaussian),
    startOutputData: Array(IOSIZE).fill().map(randomGaussian),
});

const mutateBrain = (brain, mutationRate = 0.1) => {
    const returnBrain = newBrain();
    returnBrain.instructions = returnBrain.instructions.map((ins, i) =>
        Math.random() < mutationRate ? ins : brain.instructions[i]
    );
    returnBrain.startData = returnBrain.startData.map(
        (d, i) => brain.startData[i] + mutationRate * d
    );
    returnBrain.startOutputData = returnBrain.startOutputData.map(
        (d, i) => brain.startOutputData[i] + mutationRate * d
    );
    return returnBrain;
};

const restartBrain = (brain) => {
    brain.inputData = Array(IOSIZE).fill(0);
    brain.outputData = [...brain.startOutputData];
    brain.data = [...brain.startData];
    brain.instructionPointer = 0;
};

const runBrain = (brain, steps = 1) => {
    for (let s = 0; s < steps; s++) {
        brain.instructions[brain.instructionPointer].run(brain);
        brain.instructionPointer =
            (brain.instructionPointer + 1) % INSTRUCTIONS;
    }
};

const printBrain = (brain) => {
    process.stdout.cursorTo(0, 0);
    process.stdout.clearScreenDown();
    // process.stdout.moveTo(0);
    // process.stdout.clearScreenDown();
    for (let i = 0; i < DATASIZE; i += 2) {
        console.log(
            colorit(
                i === brain.instructionPointer,
                fillToSpace(
                    `${i}: ` +
                        [
                            brain.instructions[i].opName,
                            ...brain.instructions[i].args,
                        ].join(" ")
                )
            ),
            colorit(
                i + 1 === brain.instructionPointer,
                fillToSpace(
                    `${i + 1}: ` +
                        [
                            brain.instructions[i + 1].opName,
                            ...brain.instructions[i + 1].args,
                        ].join(" ")
                )
            ),
            "|",
            fillToSpace(`${i}: ` + brain.data[i]),
            fillToSpace(`${i + 1}: ` + brain.data[i + 1])
        );
    }
    console.log("");
    for (let i = 0; i < IOSIZE; i += 2) {
        console.log(
            fillToSpace(`${i}: ` + brain.inputData[i]),
            fillToSpace(`${i + 1}: ` + brain.inputData[i + 1]),
            "|",
            fillToSpace(`${i}: ` + brain.outputData[i]),
            fillToSpace(`${i + 1}: ` + brain.outputData[i + 1])
        );
    }
};

const fillToSpace = (string, length = 28) => {
    return (
        string +
        Array(length - (string + "").length)
            .fill(" ")
            .join("")
    );
};

const colorit = (hascolor, string) => {
    if (hascolor) return `\x1b[43m${string}\x1b[0m`;
    return string;
};

const printBrainInstructions = (brain) =>
    brain.instructions
        .map(({ opName, args }, i) => [i, opName, ...args].join(" "))
        .join("\n");

const brain = newBrain();
restartBrain(brain);

const run = () => {
    printBrain(brain);
    runBrain(brain);
    setTimeout(run, 10);
};
// run();
