import {
    drawAtom,
    initializeRandomInteractions,
    interactAtom,
    moveAtom,
    newAtom,
    newAtomType,
} from "./atoms.js";
import { ctx } from "./canvas.js";
import { getNeighbors } from "./grid.js";

let paused = false;

const ATOMS = [];

window.onload = () => {
    init();
    run();
};

window.onkeydown = (e) => {
    if (e.key === " ") {
        paused = !paused;
        if (!paused) run();
    }
};

const run = () => {
    if (paused) return;

    setTimeout(() => {
        Array(1)
            .fill()
            .map(() => {
                move();
                draw();
            });
        run();
    }, 1);
};

const init = () => {
    Array(10).fill().map(newAtomType);
    // newAtomType("#f00");
    // newAtomType("#ff0");
    // newAtomType("#0f0");
    // newAtomType("#0ff");
    // newAtomType("#00f");
    // newAtomType("#f0f");
    initializeRandomInteractions();

    for (const _ of Array(100)) {
        ATOMS.push(newAtom());
    }
};

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const atom of ATOMS) {
        drawAtom(atom);
    }
};

const move = () => {
    for (const atom of ATOMS) {
        for (const atom2 of getNeighbors(atom)) {
            if (atom.atomId === atom2.atomId) continue;
            interactAtom(atom, atom2);
        }
    }

    for (const atom of ATOMS) {
        moveAtom(atom);
    }
};
