const colors = require('colors');

const drawBoard = board => {
    console.log((board.length ? board : board.board).map(line => line.map(box => box.yellow || " ").join(" | ")).join("\n" + Array(board.length ? board[0].length : board.width).fill("---").join("-").slice(2) + "\n"));
}

const hasWon = (board, piece) => {
    const boardCache = board.board.map(line => line.map(() => null));
    return checkBoard(piece, board, boardCache, 0, 0)[0] >= board.numToMatch;
}

const checkBoard = (piece, board, cache, row, col) => {
    if (row >= cache.length || col >= cache[0].length || col < 0) return [0, 0, 0, 0, 0];
    if (cache[row][col] !== null) return cache[row][col];
    const leftDown = checkBoard(piece, board, cache, row + 1, col - 1);
    const down = checkBoard(piece, board, cache, row + 1, col);
    const rightDown = checkBoard(piece, board, cache, row + 1, col + 1);
    const right = checkBoard(piece, board, cache, row, col + 1);

    if (board.board[row][col] !== piece) {
        cache[row][col] = [Math.max(...[leftDown, down, rightDown, right].map(b => b[0])), 0, 0, 0, 0];
        return cache[row][col];
    }
    const values = [leftDown[1] + 1, down[2] + 1, rightDown[3] + 1, right[4] + 1];
    cache[row][col] = [Math.max(...values, ...[leftDown, down, rightDown, right].map(b => b[0])), ...values];
    return cache[row][col];
}

const boardFull = (board) => !board.board.some(line => line.some(box => !box));

const checkEndGame = (board, piece) => {
    for (const winPiece of board.pieces) {
        if (hasWon(board, winPiece)) return piece === winPiece ? 1 : -1;
    }
    if (boardFull(board)) return 0; // tie
    return null;
}

const rotate = (board, num = 1) => {
    if (num == 0) return board;
    if (num > 1) return rotate(rotate(board, num - 1));
    return board[0].map((_, idx) => board.map((line) => line[idx])).reverse();
};

const getRotations = (board) => {
    if (board.length == board[0].length) return [board, rotate(board), rotate(board, 2), rotate(board, 3)];
    return [board, rotate(board, 2)];
};

const flip = (board) => board.map((row) => row.slice().reverse());

const compare = (board1, board2) => {
    const flat1 = board1.flat() + '';
    const flat2 = board2.flat() + '';

    return flat1 > flat2 ? 1 : (flat1 === flat2 ? 0 : -1);
};

const makeKey = (board) => [...getRotations(board), ...getRotations(flip(board))].reduce(
    (p, c) => (compare(p, c) == 1 ? p : c), []
).flat() + "";

const cacheReturn = (cache, key, value) => {
    cache[key] = value;
    return value;
}

let VOptCache = {};
const VOpt = function*(board, piece, topPlayer, maxDepth = -1) {
    const key = makeKey(board.board);
    if (VOptCache[key]) return VOptCache[key];

    const max = topPlayer === piece;
    const gameState = checkEndGame(board, piece);
    if (gameState !== null) return cacheReturn(VOptCache, key, gameState * (max ? 1 : -1));

    if (maxDepth == 0) return cacheReturn(VOptCache, key, 0);

    const range = [-1, 1];
    const possibleMoves = getPossibleMoves(board);

    for (const [row, col] of possibleMoves) {
        yield { range, pos: [row, col] };
        const childGetter = VOpt(copyBoard(board, row, col, piece), getNext(piece, board.pieces), topPlayer, maxDepth - 1);
        let child = childGetter.next();
        while (!child.done) {
            if (max) {
                if (child.value.range[0] > range[0]) {
                    range[0] = child.value.range[0];
                }
                if (child.value.range[1] <= range[0]) break;
            } else {
                if (child.value.range[1] < range[1]) {
                    range[1] = child.value.range[1];
                }
                if (child.value.range[0] >= range[1]) break;
            }
            child = childGetter.next();
        }
        if (child.done) {
            if (max && child.value > range[0]) {
                range[0] = child.value;
            } else if (!max && child.value < range[1]) {
                range[1] = child.value;
            }
        }
        if (range[0] === range[1])
            return cacheReturn(VOptCache, key, range[0]);
    }

    return cacheReturn(VOptCache, key, max ? range[0] : range[1]);
}

const getPossibleMoves = (board) => board.board.map((line, row) => line.map((box, col) => box ? null : [row, col])).flat().filter(box => box !== null);

const isValidMove = (board, row, col) => !isNaN(row) && !isNaN(col) && row >= 0 && row < board.board.length && col >= 0 && col < board.board[0].length && !board.board[row][col]

const evaluateMoves = (board, piece, topPlayer, maxDepth = -1) => {
    return getPossibleMoves(board).map(([row, col]) => ({
        value: evaluateNode(copyBoard(board, row, col, piece), getNext(piece, board.pieces), topPlayer, maxDepth),
        pos: [row, col]
    }))
}

const evaluateNode = (board, piece, topPlayer, maxDepth = -1) => {
    const a = VOpt(board, piece, topPlayer, maxDepth);
    let b = a.next();
    while (!b.done) b = a.next();
    return b.value;
}

const pickBestMove = (board, piece, topPlayer, maxDepth = -1) => {
    if (maxDepth > -1) VOptCache = {};
    const optimal = evaluateNode(board, piece, topPlayer, maxDepth);
    let moves = evaluateMoves(board, piece, topPlayer, maxDepth).filter(item => item.value === optimal);
    console.log(moves);
    return moves[Math.floor(Math.random() * moves.length)];
}

const deepCopy = (object) => object.map(item => typeof item === 'object' ? deepCopy(item) : item);

const newBoard = (height, width, pieces, numToMatch) => ({
    height,
    width,
    pieces,
    numToMatch,
    board: Array(height).fill(0).map(() => Array(width).fill(0))
});

const copyBoard = (oldBoard, row, col, piece) => {
    const board = newBoard(oldBoard.height, oldBoard.width, oldBoard.pieces, oldBoard.numToMatch);
    board.board = deepCopy(oldBoard.board);
    if (row === undefined || col === undefined || !piece || row < 0 || row >= oldBoard.height || col < 0 || col >= oldBoard.width) return board;
    board.board[row][col] = piece;
    return board;
}

const getNext = (current, list) => {
    const f = list.findIndex(i => i === current);
    if (f !== -1) return list[(f + 1) % list.length];
    return list[0];
}






//------------------------
const prompt = require('prompt-sync')();

let width = prompt('Board width? (default: 3) ');
let height = prompt('Board height? (default: 3) ');
let num = prompt('How many in a row to win? (default: 3) ');
let players = prompt('Use pieces (separate by commas) (default: X,O) ');
if (!width) width = 3;
if (!height) height = 3;
if (!num) num = 3;
if (!players) players = 'X,O';

let myBoard = newBoard(width - 0, height - 0, players.split(','), num - 0);

let ai = prompt('Which pieces do you want to be AI? (use "none" to not use AI, default: O) ');
let aiLookahead;
if (ai !== 'none') {
    if (!ai) ai = 'O';
    ai = ai.split(',');
    aiLookahead = prompt('How many moves ahead do you want the AI to look? (use -1 for no limit, default: -1) ');
    if (!aiLookahead) aiLookahead = -1;
} else ai = [];

console.log("\nSTARTING GAME\n")

drawBoard(myBoard);
console.log("")
let turn = getNext(null, myBoard.pieces);
let row, col;

while (checkEndGame(myBoard, turn) === null) {
    console.log(`--${turn}'S TURN--`);
    row = undefined;
    col = undefined;
    if (!ai.includes(turn)) {
        while (!row || !col) {
            let p = prompt('Put your piece (row,col): ');
            if (p === 'exit' || p === 'quit') throw "Exit";
            [row, col] = p.split(',');

            if (!isValidMove(myBoard, row - 0, col - 0)) {
                console.log(getPossibleMoves(myBoard));
                row = undefined;
                col = undefined;
                console.log("ENTER A VALID POSITION!")
            }
        }
    } else {
        const bestMove = pickBestMove(myBoard, turn, getNext(turn, myBoard.pieces), aiLookahead - 0);
        row = bestMove.pos[0];
        col = bestMove.pos[1];
    }
    myBoard = copyBoard(myBoard, row, col, turn);
    turn = getNext(turn, myBoard.pieces);
    drawBoard(myBoard);
    console.log(getNext(turn, myBoard.pieces) + '\'s calculated score: ' + ('' + evaluateNode(myBoard, turn, getNext(turn, myBoard.pieces), aiLookahead - 0)).yellow);

}

for (const piece of myBoard.pieces) {
    const e = checkEndGame(myBoard, piece);
    if (e === 0) { console.log('Tie Game'); break; }
    if (e === 1) { console.log(piece + ' wins!'); break; }
}