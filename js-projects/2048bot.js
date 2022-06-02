const BOARDSIZE = [4, 4];
const MAXCELL = 14; // 8192
const STARTMUTATION = 1;
const GENMUTATION = 1;
const BRAINSIZE = [BOARDSIZE[0] * BOARDSIZE[1] * MAXCELL, 100, 1];
const DEPTH = 5;


const playGame = (brain, average) => {
    let game = newGame();

    if (average) process.stdout.cursorTo(0, 0);

    while (true) {

        VCache = {};
        QCache = {};
        actionCache = {};

        const action = chooseAction({ board: game.board, points: 0 }, brain.depth, brain.estimator)[0];

        if (average) {
            process.stdout.clearScreenDown();
            process.stdout.write(`\n\nScore: ${(game.points+'').yellow}\n\n${draw(game)}\n\nAverage Score: ${(average[1]+'').yellow}\nAverage Max Cell: ${(2 ** average[0]+'').magenta}\nHighest Score: ${(average[3]+'').green}\nHighest Max Cell: ${(2 ** average[2]+'').red}`);
            process.stdout.cursorTo(0, 0);
        }

        game = move(game, action);
        game.board = newRandomPiece(game.board);

        const newMax = Math.max(...game.board.flat());
        if (newMax > game.max) game.max = newMax;

        if (checkIfGameOver(game.board) !== undefined) break;
    }

    if (average) {
        process.stdout.clearScreenDown();
        process.stdout.write(`\n\nScore: ${(game.points+'').yellow}\n\n${draw(game)}\n\nAverage Score: ${(average[1]+'').yellow}\nAverage Max Cell: ${(2 ** average[0]+'').magenta}\nHighest Score: ${(average[3]+'').green}\nHighest Max Cell: ${(2 ** average[2]+'').red}`);
        process.stdout.cursorTo(0, 0);
    }

    return [Math.max(...game.board.flat()), game.points];
}

const parse = (action) => {
    switch (action) {
        case 0:
            return 'up';
        case 1:
            return 'left';
        case 2:
            return 'down';
        case 3:
            return 'right';
    }
}

const newGame = () => {
    const game = { board: Array(BOARDSIZE[1]).fill().map(() => Array(BOARDSIZE[0]).fill(0)), points: 0 }
    Array(2).fill().forEach(() => { game.board = newRandomPiece(game.board) });
    game.max = Math.max(...game.board.flat());
    return game;
}

// returns true if won, false if lost, undefined if game still running
const checkIfGameOver = (board) => {
    // for (let y = 0; y < BOARDSIZE[1]; y++) {
    //     for (let x = 0; x < BOARDSIZE[0]; x++) {
    //         if (board[y][x] === MAXCELL) return true;
    //     }
    // }
    for (let y = 0; y < BOARDSIZE[1]; y++) {
        for (let x = 0; x < BOARDSIZE[0]; x++) {
            if (board[y][x] === 0) return;
            if (y < BOARDSIZE[1] - 1 && board[y][x] === board[y + 1][x]) return;
            if (x < BOARDSIZE[0] - 1 && board[y][x] === board[y][x + 1]) return;
        }
    }
    return false;
}

const move = (game, action, tryNum = 0) => {
    let dir;
    switch (action) {
        case 0:
            // case 'u':
            dir = [0, -1];
            break;
        case 1:
            // case 'l':
            dir = [-1, 0];
            break;
        case 2:
            // case 'd':
            dir = [0, 1];
            break;
        case 3:
            // case 'r':
            dir = [1, 0];
            break;
        default:
            throw "dir must be of the form (Int x | x in [0..4)) (Char x | x in 'uldr')! " + action;
    }

    let { board, points } = game;

    const lastboard = copyBoard(board);

    for (let y = 0; y < BOARDSIZE[1]; y++) {
        for (let x = 0; x < BOARDSIZE[0]; x++) {
            [board, points] = tryToMove(board, points, x, y, dir);
        }
    }

    if (tryNum < 4 && lastboard.every((row, i) => row.every((x, j) => x === board[i][j]))) return move(game, (action + 1) % 4, true);

    return { board, points, max: game.max };
}

const copyBoard = (board) => [...board.map(row => [...row])];

// TODO: Account for 3 in a row and 4 in a row
const tryToMove = (board, points, x, y, dir) => {
    if (board[y][x] === 0 || x + dir[0] < 0 || x + dir[0] >= BOARDSIZE[0] || y + dir[1] < 0 || y + dir[1] >= BOARDSIZE[1]) return [copyBoard(board), points];
    if (board[y + dir[1]][x + dir[0]] === 0) {
        let newBoard = copyBoard(board);
        newBoard[y + dir[1]][x + dir[0]] = newBoard[y][x];
        newBoard[y][x] = 0;
        return tryToMove(newBoard, points, x + dir[0], y + dir[1], dir);
    }
    let [newBoard, newPoints] = tryToMove(board, points, x + dir[0], y + dir[1], dir);
    if (newBoard[y + dir[1]][x + dir[0]] === 0) {
        newBoard[y + dir[1]][x + dir[0]] = newBoard[y][x];
        newBoard[y][x] = 0;
    } else if (newBoard[y + dir[1]][x + dir[0]] === newBoard[y][x]) {
        newPoints += 2 ** (newBoard[y][x] + 1);
        newBoard[y + dir[1]][x + dir[0]] = newBoard[y][x] + 1;
        newBoard[y][x] = 0;
    }
    return [newBoard, newPoints];
}

const newRandomPiece = (board) => {
    if (board.every(row => row.every(cell => cell))) return board;
    let newBoard = copyBoard(board);
    while (true) {
        const [x, y] = Array(2).fill().map((_, i) => Math.floor(Math.random() * BOARDSIZE[i]));
        if (!board[y][x]) {
            newBoard[y][x] = Math.round(Math.random() + 1);
            return newBoard;
        }
    }
};

const allPossibleNewRandomPieces = (board) => {
    const newBoards = [];
    for (let y = 0; y < BOARDSIZE[1]; y++) {
        for (let x = 0; x < BOARDSIZE[0]; x++) {
            if (board[y][x]) continue;
            let newBoard1 = copyBoard(board);
            let newBoard2 = copyBoard(board);
            newBoard1[y][x] = 1;
            newBoard2[y][x] = 2;
            newBoards.push(newBoard1, newBoard2); // push is slow
        }
    }
    return newBoards;
}

const draw = (game) => {
    return game.board.map(row => row.map(cell => cell === game.max ? (2 ** cell + '').red : cell === 0 ? '' : 2 ** cell).join('\t')).join('\n');
}

// optimization stuff

const cache = (myCache, key, value) => {
    myCache[key] = value;
    return value;
}

const makeKey = (board) => {
    const M = Math.max(...board.flat());
    // return board.map(row => row.map(cell => cell ? M + 1 - cell : 0).join(',')).join(';');
    // cannot use action cache if using maximized cells
    return board.map(row => row.join(',')).join(';');
}

let VCache = {};
const V = (game, depth, estimator) => {
    if (checkIfGameOver(game.board) === false) return 0;
    if (depth === 0) return game.points;
    const key = makeKey(game.board) + '.' + depth;
    if (VCache[key]) return VCache[key];

    // console.log(`V(${key})`);
    const bestAction = chooseAction(game, depth, estimator);
    return cache(VCache, key, bestAction[1]);
}

let QCache = {};
const Q = (game, action, depth, estimator) => {
    const key = makeKey(game.board) + '.' + action + '.' + depth;
    if (QCache[key]) return QCache[key];
    // console.log(`Q(${key})`);
    const game2 = move(game, action);
    const newBoards = allPossibleNewRandomPieces(game2.board);
    // console.log(newBoards);
    return cache(QCache, key, newBoards.length === 0 ? game2.points : (newBoards.reduce((p, c) => p + V({ board: c, points: game2.points }, depth - 1, estimator), 0) / newBoards.length));
}

let actionCache = {};
const chooseAction = (game, depth, estimator) => {
    const key = makeKey(game.board) + '.' + depth;
    if (actionCache[key]) return actionCache[key];
    const actionScores = ACTIONS.map(action => Q(game, action, depth, estimator));
    // console.log(VCache);
    const bestAction = argmax(actionScores);
    return cache(actionCache, key, [bestAction, actionScores[bestAction]]);
}

const ACTIONS = [0, 1, 2, 3];


// neural network stuff

const getEncoding = (board) => {
    const encoding = Array(BOARDSIZE[0] * BOARDSIZE[1] * MAXCELL).fill(0);
    board.flat().forEach(((cell, i) => { encoding[cell] = 1; }));
    return encoding;
}

const newBrain = () => {
    const brain = {
        // neuralNet: newNeuralNet(),
        depth: DEPTH
    }
    brain.estimator = (board) => board.flat().reduce((p, c) => p + 2 ** c, 0);
    return brain;
};

const newNeuralNet = (oldNet, mutation = STARTMUTATION, brainSize = BRAINSIZE) => {
    if (oldNet === undefined)
        return brainSize.slice(1).map((size, i) => newLinearLayer(brainSize[i], size, mutation));
    return newNeuralNet(undefined, GENMUTATION).map((layer, i) => [add(layer[0], oldNet[i][0]), add(layer[1], oldNet[i][1])]);
}

const newLinearLayer = (input, output, mutation) => [Array(output).fill().map(() => Array(input).fill().map(() => (Math.random() * 2 - 1) * mutation)), Array(output).fill().map(() => (Math.random() * 2 - 1) * mutation)];

const sigma = (x) => x > 0 ? x : 0;
const passThroughBrain = (input, brain) => {
    for (const layer of brain) input = add(matMult(layer[0], input), layer[1]).map(sigma);
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

const argmin = (list) => {
    let best = Number.POSITIVE_INFINITY;
    let j = -1;
    for (let i = 0; i < list.length; i++) {
        if (list[i] < best) {
            best = list[i];
            j = i;
        }
    }
    return j;
}

const score = (brain, iterations) => Array(iterations).fill().reduce((p, c, i) => {
    const a = playGame(brain, i === 0 ? [0, 0, 0, 0] : p.map((a, j) => j < 2 ? a / i : a));
    return [p[0] + a[0], p[1] + a[1], Math.max(p[2], a[0]), Math.max(p[3], a[1])];
}, [0, 0, 0, 0]).map((a, j) => j < 2 ? a / iterations : a);

require('colors');
const fs = require('fs');

const brain = newBrain(); // unneccesary
const scores = score(brain, 100);
process.stdout.clearScreenDown();
console.log(`Average Score: ${(scores[1]+'').yellow}`);
console.log(`Average Max Cell: ${(2 ** scores[0]+'').magenta}`);
console.log(`Highest Score: ${(scores[3]+'').green}`);
console.log(`Highest Max Cell: ${(2 ** scores[2]+'').red}`);