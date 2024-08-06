const N = 2;

const possibles = [];

const newBoard = () =>
    Array(N ** 2)
        .fill()
        .map((_, i) =>
            Array(N ** 2)
                .fill()
                .map((_, j) => (i === 0 ? j + 1 : undefined))
        );

const generateOptions = (board, i, j) => {
    return Array(N ** 2)
        .fill()
        .map((_, k) => [
            ...board.slice(0, i),
            [...board[i].slice(0, j), k + 1, ...board[i].slice(j + 1)],
            ...board.slice(i + 1),
        ]);
};

const checkValid = (board) => {
    for (const row of board) {
        const set = {};
        for (const value of row) {
            if (!value) continue;
            if (set[value]) return false;
            set[value] = true;
        }
    }
    for (let i = 0; i < N ** 2; i++) {
        const set = {};
        for (const row of board) {
            const value = row[i];
            if (!value) continue;
            if (set[value]) return false;
            set[value] = true;
        }
    }
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const set = {};
            for (let k = 0; k < N; k++) {
                for (let l = 0; l < N; l++) {
                    const value = board[i * N + k][j * N + l];
                    if (!value) continue;
                    if (set[value]) return false;
                    set[value] = true;
                }
            }
        }
    }
    return true;
};

const findOpenSpot = (board) => {
    for (let i = 0; i < N ** 2; i++) {
        for (let j = 0; j < N ** 2; j++) {
            if (!board[i][j]) return [i, j];
        }
    }
    return null;
};

const countBoards = () => {
    // const totalBoards = [];
    let boardCount = 0;

    const boards = [newBoard()];
    while (boards.length) {
        const board = boards.pop();
        if (!checkValid(board)) continue;
        if (Math.random() * 100000 < 1) console.log(boardCount);
        const openSpot = findOpenSpot(board);
        if (!openSpot) {
            boardCount++;
        } else boards.push(...generateOptions(board, openSpot[0], openSpot[1]));
    }
    return boardCount;
};

console.log(countBoards());
