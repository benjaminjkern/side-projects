import { canvas, ctx, DT, windowDimensions } from "./canvas.js";
import { INTERACTION_DISTANCE, setGridIndex } from "./grid.js";
import { addVec, dotVec, multVec, subVec } from "./math.js";

const ATOM_TYPES = [];
const ATOM_RADIUS = 5;
const INTERACTION_STRENGTH = 5;
const REPEL_STRENGTH = 5;

const DRAG = 0.01;

export const newAtomType = (
    color = `#${Math.random().toString(16).slice(2, 8)}`
) => {
    ATOM_TYPES.push({
        typeIndex: ATOM_TYPES.length,
        color,
        interactions: {},
        mass: 1,
    });
};

export const initializeRandomInteractions = () => {
    ATOM_TYPES.forEach((atomType, i) => {
        ATOM_TYPES.forEach((otherAtomType, j) => {
            atomType.interactions[j] =
                INTERACTION_STRENGTH * (Math.random() * 2 - 1);
        });
    });
    console.log(ATOM_TYPES);
};

export const drawAtom = (atom) => {
    ctx.fillStyle = atom.atomType.color;
    ctx.beginPath();
    ctx.arc(...atom.position, ATOM_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
};

export const moveAtom = (atom) => {
    atom.acceleration = subVec(
        atom.acceleration,
        multVec(DRAG / atom.atomType.mass, atom.velocity)
    );
    atom.position = addVec(
        atom.position,
        addVec(
            multVec(DT, atom.velocity),
            multVec((DT * DT) / 2, atom.acceleration)
        )
    );
    atom.velocity = addVec(atom.velocity, multVec(DT, atom.acceleration));

    // Check walls lol
    Array(2)
        .fill()
        .map((_, i) => {
            atom.position[i] =
                (atom.position[i] + windowDimensions[i]) % windowDimensions[i];
            // if (
            //     atom.position[i] < 0 ||
            //     atom.position[i] > windowDimensions[i]
            // ) {
            //     atom.velocity[i] = -atom.velocity[i];
            //     atom.position[i] =
            //         windowDimensions[i] -
            //         Math.abs(
            //             ((atom.position[i] + 2 * windowDimensions[i]) %
            //                 (2 * windowDimensions[i])) -
            //                 windowDimensions[i]
            //         );
            // }
        });

    setGridIndex(atom);
    atom.acceleration = [0, 0];
};

export const interactAtom = (atom, atom2) => {
    const diff = subVec(atom2.position, atom.position);
    const distSquared = dotVec(diff, diff);
    const dist = Math.sqrt(distSquared);
    atom.acceleration = addVec(
        atom.acceleration,
        multVec(
            activationFunction(
                atom.atomType.interactions[atom2.atomType.typeIndex],
                dist
            ) /
                dist /
                atom.atomType.mass,
            diff
        )
    );
};

const activationFunction = (interactionStrength, x) => {
    if (x < ATOM_RADIUS * 2) return -REPEL_STRENGTH * (2 * ATOM_RADIUS - x);
    if (x > INTERACTION_DISTANCE) return 0;
    if (x < ATOM_RADIUS + INTERACTION_DISTANCE / 2)
        return (
            (interactionStrength / (-ATOM_RADIUS + INTERACTION_DISTANCE / 2)) *
            (x - 2 * ATOM_RADIUS)
        );
    return (
        (interactionStrength / (ATOM_RADIUS - INTERACTION_DISTANCE / 2)) *
        (x - INTERACTION_DISTANCE)
    );
};

let idCounter = 0;

export const newAtom = (
    typeIndex = Math.floor(Math.random() * ATOM_TYPES.length)
) => {
    const atom = {
        atomId: idCounter,
        atomType: ATOM_TYPES[typeIndex],
        position: windowDimensions.map((w) => Math.random() * w),
        velocity: [Math.random() * 2 - 1, Math.random() * 2 - 1],
        acceleration: [0, 0],
    };
    idCounter++;
    setGridIndex(atom);
    return atom;
};
