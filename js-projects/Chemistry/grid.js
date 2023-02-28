import { windowDimensions } from "./canvas.js";

export const INTERACTION_DISTANCE = 50;

const gridDimensions = windowDimensions.map((w) =>
    Math.ceil(w / INTERACTION_DISTANCE)
);

export const grid = Array(gridDimensions[0])
    .fill()
    .map((_, x) =>
        Array(gridDimensions[1])
            .fill()
            .map((_, y) => ({}))
    );

export const setGridIndex = (atom) => {
    const newGridIndex = atom.position.map((x, i) =>
        Math.floor(x / INTERACTION_DISTANCE)
    );
    if (
        !atom.gridIndex ||
        newGridIndex.some((g, i) => g !== atom.gridIndex[i])
    ) {
        if (atom.gridIndex)
            delete grid[atom.gridIndex[0]][atom.gridIndex[1]][atom.atomId];
        atom.gridIndex = newGridIndex;
        grid[atom.gridIndex[0]][atom.gridIndex[1]][atom.atomId] = atom;
    }
};

export const getNeighbors = (atom) => {
    return Array(3)
        .fill()
        .flatMap((_, dx) =>
            Array(3)
                .fill()
                .flatMap((_, dy) => getGrid(atom, [dx, dy]))
        );
};

export const getGrid = (atom, d) => {
    // if (
    //     d.some(
    //         (di, i) =>
    //             atom.gridIndex[i] + di - 1 < 0 ||
    //             atom.gridIndex[i] + di - 1 >= gridDimensions[i]
    //     )
    // )
    //     return [];

    return Object.values(
        grid[
            (atom.gridIndex[0] + d[0] - 1 + gridDimensions[0]) %
                gridDimensions[0]
        ][
            (atom.gridIndex[1] + d[1] - 1 + gridDimensions[1]) %
                gridDimensions[1]
        ]
    );
};
