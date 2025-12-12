const allSame = (board, ...indexes) => {
  let first = board[indexes[0]];
  if (!first) return false;
  for (let i = 1; i < indexes.length; i++) {
    if (board[indexes[i]] !== first) return false;
  }
  return true;
};

const endGame = (board) => {
  // rows
  if (allSame(board, 0, 1, 2)) return board[0];
  if (allSame(board, 3, 4, 5)) return board[3];
  if (allSame(board, 6, 7, 8)) return board[6];
  // columns
  if (allSame(board, 0, 3, 6)) return board[0];
  if (allSame(board, 1, 4, 7)) return board[1];
  if (allSame(board, 2, 5, 8)) return board[2];
  // diagonals
  if (allSame(board, 0, 4, 8)) return board[0];
  if (allSame(board, 2, 4, 6)) return board[2];

  if (board.filter((x) => x).length === 9) return "C";

  return null;
};

const makeMove = (board, i, char) => [
  ...board.slice(0, i),
  char,
  ...board.slice(i + 1, 9),
];

const printBoard = (board, spaces) => {
  console.log();
  console.log(
    `${Array(spaces).fill("  ").join("")}${board
      .slice(0, 3)
      .map((x) => (x === null ? "•" : x))
      .join("")}`,
  );
  console.log(
    `${Array(spaces).fill("  ").join("")}${board
      .slice(3, 6)
      .map((x) => (x === null ? "•" : x))
      .join("")}`,
  );
  console.log(
    `${Array(spaces).fill("  ").join("")}${board
      .slice(6, 9)
      .map((x) => (x === null ? "•" : x))
      .join("")}`,
  );
};

const getNextMoves = (board) => {
  const nextMoves = [];
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    nextMoves.push(i);
  }
  return nextMoves;
};

const flipBoard = (board) => {
  return [...board.slice(6, 9), ...board.slice(3, 6), ...board.slice(0, 3)];
};
const rotateBoard = (board) => {
  return [
    board[6],
    board[3],
    board[0],
    board[7],
    board[4],
    board[1],
    board[8],
    board[5],
    board[2],
  ];
};

const makeKey = (board) => {
  const potentialKeys = [board.join(",")];
  let activeBoard = rotateBoard(board);
  potentialKeys.push(activeBoard.join(","));
  activeBoard = rotateBoard(activeBoard);
  potentialKeys.push(activeBoard.join(","));
  activeBoard = rotateBoard(activeBoard);
  potentialKeys.push(activeBoard.join(","));
  activeBoard = flipBoard(activeBoard);
  potentialKeys.push(activeBoard.join(","));
  activeBoard = rotateBoard(activeBoard);
  potentialKeys.push(activeBoard.join(","));
  activeBoard = rotateBoard(activeBoard);
  potentialKeys.push(activeBoard.join(","));
  activeBoard = rotateBoard(activeBoard);
  potentialKeys.push(activeBoard.join(","));
  potentialKeys.sort();
  return potentialKeys[0];
};

const getNextChar = (board) => {
  let count = 0;
  for (let i = 0; i < 9; i++) {
    if (board[i] === "X") count++;
    if (board[i] === "O") count--;
  }
  return count > 0 ? "O" : "X";
};

const cache = {};

const evaluate = (board) => {
  const key = makeKey(board);
  if (cache[key]) return cache[key];

  const result = endGame(board);
  if (result) {
    cache[key] = result;
    return result;
  }
  const nextChar = getNextChar(board);
  let bestResult = nextChar === "X" ? "O" : "X";

  for (const move of getNextMoves(board)) {
    const nextBoard = makeMove(board, move, nextChar);
    const nextResult = evaluate(nextBoard);
    if (nextResult === nextChar) {
      cache[key] = nextResult;
      return nextResult;
    }
    if (nextResult === "C") bestResult = "C";
  }
  cache[key] = bestResult;
  return bestResult;
};

let spaces = 0;

const countGames = (board) => {
  const endResult = endGame(board);
  if (endResult) return [board];

  let results = [];
  const seen = {};
  const nextChar = getNextChar(board);
  let currentBest = nextChar === "X" ? "O" : "X";
  for (const move of getNextMoves(board)) {
    const nextBoard = makeMove(board, move, nextChar);
    const key = makeKey(nextBoard);
    if (seen[key]) continue;
    seen[key] = true;

    const result = evaluate(nextBoard);

    if (result === nextChar) {
      if (currentBest !== nextChar) {
        results = [];
      }
      currentBest = nextChar;
      results.push(countGames(nextBoard));
    } else if (result === "C") {
      if (currentBest === nextChar) continue;
      if (currentBest !== "C") {
        results = [];
      }
      currentBest = "C";

      results.push(countGames(nextBoard));
    } else {
      if (currentBest === "C" || currentBest === nextChar) continue;
      results.push(countGames(nextBoard));
    }
  }
  return results;
};

const games = countGames([
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
]);

const spacesFromS = () => Array(s).fill("  ").join("");

let s = 0;
const printGames = (games) => {
  if (!Array.isArray(games[0]))
    console.log(`${spacesFromS()}${games.join(",")}`);
  else if (games.length === 1) printGames(games[0]);
  else {
    console.log(`${spacesFromS()}{`);
    s++;
    for (const game of games) {
      printGames(game);
    }
    s--;
    console.log(`${spacesFromS()}}`);
  }
};

printGames(games);
