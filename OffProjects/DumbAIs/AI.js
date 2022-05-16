const IOSIZE = 8;
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
    readInput: {
        run:
            ([q, p]) =>
            (brain) => {
                brain.data[p] = brain.inputData[q];
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

    // descriptions.push([opName, ...args]);

    return operation.run(args);
};

// const descriptions = [];

const newBrain = () => ({
    instructions: Array(INSTRUCTIONS).fill().map(randomInstruction),
    data: Array(DATASIZE).fill().map(randomGaussian),
    inputData: Array(IOSIZE).fill(0),
    outputData: Array(IOSIZE).fill(0),
    instructionPointer: 0,
});

const runBrain = (brain) => {
    // printBrain(brain);
    brain.instructions[brain.instructionPointer](brain);
    brain.instructionPointer = (brain.instructionPointer + 1) % INSTRUCTIONS;
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
                fillToSpace(descriptions[i].join(" "))
            ),
            colorit(
                i + 1 === brain.instructionPointer,
                fillToSpace(descriptions[i + 1].join(" "))
            ),
            "|",
            fillToSpace(brain.data[i]),
            fillToSpace(brain.data[i + 1])
        );
    }
    console.log("");
    for (let i = 0; i < IOSIZE; i += 2) {
        console.log(
            fillToSpace(brain.inputData[i]),
            fillToSpace(brain.inputData[i + 1]),
            "|",
            fillToSpace(brain.outputData[i]),
            fillToSpace(brain.outputData[i + 1])
        );
    }
};

const fillToSpace = (string, length = 25) => {
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
