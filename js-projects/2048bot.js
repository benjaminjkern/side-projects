const BOARDSIZE = [4, 4];
const MAXCELL = 11; // 2048
const STARTMUTATION = 1;
const GENMUTATION = 1;
const NUM = 1;
const BRAINSIZE = [BOARDSIZE[0] * BOARDSIZE[1] * MAXCELL, 100, 100, 4];

let board = [];
let gamerunning = false;
let points = 0;
const start = (brain) => {
    gamerunning = true;
    board = Array(BOARDSIZE[1]).fill().map(() => Array(BOARDSIZE[0]).fill(0));
    Array(2).fill().forEach(() => {
        newRandomPiece();
    });
    points = 0;

    let t = 0;
    while (true) {
        t++;
        const lastboard = [...board.map(row => [...row])];
        const order = passThroughBrain(getEncoding(), brain);
        while (true) {
            const best = argmax(order);
            if (Math.max(order) === -1 || best === -1) break;
            move(best);
            newRandomPiece();
            if (lastboard.every((row, i) => row.every((x, j) => x === board[i][j]))) {
                order[best] = -1;
                continue;
            }
            break;
        }
        if (checkIfGameOver() !== undefined) break;
        // if (checkIfGameOver()) console.log("WE HAVE A WINNER");
    }
    // if (points === 0) {
    //     console.log()
    //     draw();
    //     console.log(argmax(passThroughBrain(getEncoding(), brain)));
    // }

    // console.log("Game over!");
}

const checkIfGameOver = () => {
    for (let y = 0; y < BOARDSIZE[1]; y++) {
        for (let x = 0; x < BOARDSIZE[0]; x++) {
            if (board[y][x] === 0) return;
            if (board[y][x] === MAXCELL) return true;
            if (y < BOARDSIZE[1] - 1 && board[y][x] === board[y + 1][x]) return;
            if (x < BOARDSIZE[0] - 1 && board[y][x] === board[y][x + 1]) return;
        }
    }
    return false;
}

const move = (dir) => {
    if (typeof dir !== 'object' && dir.length !== 2) {
        switch (dir) {
            case 0:
            case 'u':
                // console.log('u');
                dir = [0, -1];
                break;
            case 1:
            case 'l':
                // console.log('l');
                dir = [-1, 0];
                break;
            case 2:
            case 'd':
                // console.log('d');
                dir = [0, 1];
                break;
            case 3:
            case 'r':
                // console.log('r');
                dir = [1, 0];
                break;
            default:
                throw "dir must be of the form [ (Int), (Int) ]!";
        }
    }

    for (let y = 0; y < BOARDSIZE[1]; y++) {
        for (let x = 0; x < BOARDSIZE[0]; x++) {
            tryToMove(x, y, dir);
        }
    }
}

const tryToMove = (x, y, dir) => {
    if (board[y][x] === 0 || x + dir[0] < 0 || x + dir[0] >= BOARDSIZE[0] || y + dir[1] < 0 || y + dir[1] >= BOARDSIZE[1]) return;
    if (board[y + dir[1]][x + dir[0]] === 0) {
        board[y + dir[1]][x + dir[0]] = board[y][x];
        board[y][x] = 0;
        return tryToMove(x + dir[0], y + dir[1], dir);
    }
    tryToMove(x + dir[0], y + dir[1], dir);
    if (board[y + dir[1]][x + dir[0]] === 0) {
        board[y + dir[1]][x + dir[0]] = board[y][x];
        board[y][x] = 0;
    }
    if (board[y + dir[1]][x + dir[0]] === board[y][x]) {
        points += 2 ** (board[y][x] + 1);
        board[y + dir[1]][x + dir[0]] = board[y][x] + 1;
        board[y][x] = 0;
    }
}

const newRandomPiece = () => {
    if (board.every(row => row.every(cell => cell))) return;
    let placed = false;
    while (!placed) {
        const [x, y] = Array(2).fill().map((_, i) => Math.floor(Math.random() * BOARDSIZE[i]));
        if (!board[y][x]) {
            placed = true;
            board[y][x] = Math.round(Math.random() + 1);
        }
    }
};

const draw = () => {
    for (const row of board) {
        console.log(row.join('\t'));
    }
};

const getEncoding = () => {
    const max = Math.max(...board.flat());
    const encoding = Array(BOARDSIZE[0] * BOARDSIZE[1] * MAXCELL).fill(0);
    board.flat().forEach(((cell, i) => { encoding[max - cell + i * MAXCELL] = 1; }));
    return encoding;
}

const newBrain = (oldBrain, mutation = STARTMUTATION) => {
    if (oldBrain === undefined)
        return BRAINSIZE.slice(1).map((size, i) => newLinearLayer(BRAINSIZE[i], size, mutation));
    return newBrain(undefined, GENMUTATION).map((layer, i) => [add(layer[0], oldBrain[i][0]), add(layer[1], oldBrain[i][1])]);
}

const newLinearLayer = (input, output, mutation) => {
    return [Array(output).fill().map(() => Array(input).fill().map(() => (Math.random() * 2 - 1) * mutation)), Array(output).fill().map(() => (Math.random() * 2 - 1) * mutation)];
}

const sigma = (x) => 1 / (1 + Math.exp(-x));
const passThroughBrain = (input, brain) => {
    for (const layer of brain) {
        input = add(matMult(layer[0], input), layer[1]).map(sigma);
    }
    return input;
}

// assumes A is matrix, B is vector (I am lazy)
const matMult = (A, B) => A.map(row => dot(row, B));

const dot = (a, b) => a.reduce((p, c, i) => p + c * b[i], 0);

const add = (a, b) => {
    if (a.length === undefined) return a + b;
    return a.map((x, i) => add(x, b[i]));
}

const argmax = (list) => {
    let best = Number.NEGATIVE_INFINITY;
    let j = -1;
    for (let i = 0; i < list.length; i++) {
        if (list[i] > best) {
            best = list[i];
            j = i;
        }
    }
    return j;
}

const score = (brain) => Array(NUM).fill().map(() => {
    start(brain);
    return [Math.max(...board.flat()), points];
}).reduce((p, c) => [p[0] + c[0], p[1] + c[1]], [0, 0]).map(a => a / NUM);

// start();

// draw();
// getEncoding().map(x => console.log(x));
require('colors');
const fs = require('fs');
const { inspect } = require('util');

let brain = newBrain();
let best = score(brain);
let avg = best;
let t = 0;
while (true) {
    const b = newBrain(brain);
    const s = score(b);
    t++;
    avg = [(s[0] + avg[0] * Math.log(t + 1)) / (Math.log(t + 1) + 1), (s[1] + avg[1] * Math.log(t + 1)) / (Math.log(t + 1) + 1)];
    if (s[0] > best[0] || s[1] > best[1]) {
        // console.log("Yippee!".green);
        best = s;
        brain = b;
        // console.log(best);
        fs.writeFileSync('bestbot.txt', inspect(b, true, null, false), { flag: "w+" });
    }
    if (t % 100 === 0) console.log(`Avg: ${avg.map(a => (Math.round(a * 100) / 100+'').yellow).join(', ')}\tBest: ${best.map(a => (Math.round(a * 100) / 100+'').yellow).join(', ')}`);

}