const dot = (a, b) => a.reduce((p, c, i) => p + c * b[i], 0);

const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];

const vecLength = (v) => Math.sqrt(dot(v, v));

const GRIDSIZE = [200, 200];

let maxValue;

let coef;

let fieldSize;
let field;
let dfield;

let noiseGrid = {};

const randomUnitVec = () => {
    const theta = Math.random() * Math.PI * 2;
    return [Math.cos(theta), Math.sin(theta)];
}

const smoothen = (x) => {
    if (x < 0) return smoothen(-x);
    if (x > 1) return 1;
    return 3 * x ** 2 - 2 * x ** 3;
}

const noise = (x, y, blocks) => {
    const blockWidth = GRIDSIZE[0] / blocks;
    const blockHeight = GRIDSIZE[1] / blocks;

    if (noiseGrid[blocks] === undefined) {
        noiseGrid[blocks] = Array(blocks ** 2).fill().map(() => randomUnitVec());
    }

    const gridX = Math.floor(x / blockWidth);
    const gridY = Math.floor(y / blockHeight);

    const vectors = Array(4).fill().map((_, i) => noiseGrid[blocks][((gridX + (i & 1)) % blocks) * blocks + (gridY + (i >> 1)) % blocks]);

    const displacements = Array(4).fill().map((_, i) => [x - (gridX + (i & 1)) * blockWidth, y - (gridY + (i >> 1)) * blockHeight]);

    // if (x <= 1 && y <= 1) console.log(gridX, gridY, vectors, displacements,);

    return vectors.reduce((p, v, i) => p + dot(v, displacements[i]) * (1 - smoothen(displacements[i][0] / blockWidth)) * (1 - smoothen(displacements[i][1] / blockHeight)), 0);
}

const VALUERANGE = [-1, 1];
const TERMRANGE = [0, 5];
const POWERRANGE = [1, 1];
const DISTRANGE = [-2, 2];

const init = () => {

    fieldSize = Math.round(GRIDSIZE.reduce((p, c) => p * c, 1));

    field = Array(fieldSize);
    dfield = Array(fieldSize);

    noiseGrid = {};

    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            const index = makeIdx(x, y);

            field[index] = 0;
            // field[index] = noise(x, y, 100) + noise(x, y, 50) + noise(x, y, 20) + noise(x, y, 10) + noise(x, y, 5);
        }
    }

    coef = Array(20).fill().map(() => ({
        value: randrange(VALUERANGE), terms:
            Array(Math.floor(randrangeint(TERMRANGE))).fill().map(() => (
                { dx: randrangeint(DISTRANGE), dy: randrangeint(DISTRANGE), power: randrangeint(POWERRANGE) }
            ))
    }));
    // coef = [
    //     // { value: Math.random() * 2 - 1, terms: [] },
    //     // { value: Math.random() * 2 - 1, terms: [{ dx: 0, dy: 0, power: 1 }] },

    //     { value: 1, terms: [{ dx: 1, dy: 0, power: 1 }] },
    //     { value: 1, terms: [{ dx: -1, dy: 0, power: 1 }] },
    //     { value: 1, terms: [{ dx: 0, dy: 1, power: 1 }] },
    //     { value: 1, terms: [{ dx: 0, dy: -1, power: 1 }] },

    //     { value: 1, terms: [{ dx: 1, dy: 1, power: 1 }] },
    //     { value: 1, terms: [{ dx: 1, dy: -1, power: 1 }] },
    //     { value: 1, terms: [{ dx: -1, dy: 1, power: 1 }] },
    //     { value: 1, terms: [{ dx: -1, dy: -1, power: 1 }] },
    // ];

    console.log(coef);

    // coef = [{ value: 1, terms: [{ dx: 1, dy: 1, power: 1 }] },];
}

const randrange = ([low, high]) => Math.random() * (high - low) + low;
const randrangeint = ([low, high]) => Math.floor(Math.random() * (high - low + 1)) + low;

const getField = (x, y) => {
    // if (x < 0 || x >= GRIDSIZE[0] || y < 0 || y >= GRIDSIZE[1]) return 0;
    return field[makeIdx(x, y)];
}

// currently boundary condition wraps all fields
const makeIdx = (...pos) => pos.reduce((p, c, i) => GRIDSIZE[i] * p + (c + GRIDSIZE[i]) % GRIDSIZE[i], 0);

const step = () => {

    // Calculate derivatives
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {

            dfield[makeIdx(x, y)] = coef.reduce((s, c) => s + c.value * c.terms.reduce((p, f) => p * (getField(x + f.dx, y + f.dy) ** f.power), 1), 0);

            // set update values
            if (mousedown) {
                const pm = [x - mousex, y - mousey];
                const pl = [x - lastmousex, y - lastmousey];
                const diff = [mousex - lastmousex, mousey - lastmousey];
                if (dot(pl, diff) > 0 && dot(pm, diff) < 0) {
                    const projLength = dot(pl, diff) / dot(diff, diff);
                    const orth = [pl[0] - projLength * diff[0], pl[1] - projLength * diff[1]];
                    if (orth[0] ** 2 + orth[1] ** 2 < radius ** 2) dfield[makeIdx(x, y)] = mousevalue;
                } else if ((x - mousex) ** 2 + (y - mousey) ** 2 < radius ** 2 || (x - lastmousex) ** 2 + (y - lastmousey) ** 2 < radius ** 2) dfield[makeIdx(x, y)] = mousevalue;

            }
        }
    }

    // maxValue = 0;

    //update
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            const index = makeIdx(x, y);

            field[index] = Math.max(VALUERANGE[0], Math.min(VALUERANGE[1], dfield[index]));

            // maxValue = Math.max(field[index], maxValue, -maxValue);
        }
    }

    const midIdx = makeIdx(Math.floor(GRIDSIZE[0] / 2), Math.floor(GRIDSIZE[1] / 2));

    field[midIdx] = randrange(VALUERANGE);

    // change the coef slightly
    const newCoef = coef[Math.floor(Math.random() * coef.length)];
    if (Math.random() > 0.5)
        newCoef.value = Math.max(VALUERANGE[0], Math.min(VALUERANGE[1], newCoef.value + randrange(VALUERANGE)));
    else {
        if (newCoef.terms.length > 0) {
            const newTerm = newCoef.terms[Math.floor(Math.random() * newCoef.terms.length)];
            if (Math.random() > 0.5)
                newTerm.power = Math.max(POWERRANGE[0], Math.min(POWERRANGE[1], newTerm.power + randrangeint([-1, 1])));
            else if (Math.random() > 0.5)
                newTerm.dx = Math.max(DISTRANGE[0], Math.min(DISTRANGE[1], newTerm.dx + randrangeint([-1, 1])));
            else
                newTerm.dy = Math.max(DISTRANGE[0], Math.min(DISTRANGE[1], newTerm.dy + randrangeint([-1, 1])));
        }
    }

    draw();

    setTimeout(step, 1);
    // console.log(maxValue);
};

let canvas, ctx;

const sigmoid = (x) => 1 / (1 + Math.exp(-x));

const draw = () => {
    const boxWidth = canvas.width / GRIDSIZE[0];
    const boxHeight = canvas.height / GRIDSIZE[1];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            const value = Math.floor((field[makeIdx(x, y)] + 1) / 2 * 256);

            ctx.fillStyle = `rgb(${value}, ${value},${value})`;
            ctx.fillRect(x * boxWidth, y * boxHeight, boxWidth + 1, boxHeight + 1);
        }
    }
}

window.onload = () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;


    GRIDSIZE[0] = Math.round(canvas.width / 5);
    GRIDSIZE[1] = Math.round(canvas.height / 5);

    init();
    step();
}

let mousedown = false;
let mousex;
let mousey;

let lastmousex;
let lastmousey;

let mousevalue;

const radius = 3;

document.onkeydown = init;

document.onmousedown = () => {
    mousevalue = -field[makeIdx(Math.floor(mousex), Math.floor(mousey))];
    lastmousex = mousex;
    lastmousey = mousey;
    mousedown = true;
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            if ((x - mousex) ** 2 + (y - mousey) ** 2 < radius ** 2 || (x - lastmousex) ** 2 + (y - lastmousey) ** 2 < radius ** 2) field[makeIdx(x, y)] = mousevalue;
        }
    }
}

document.onmouseup = () => {
    mousedown = false;
}

document.onmousemove = (e) => {
    lastmousex = mousex;
    lastmousey = mousey;
    mousex = e.x / canvas.width * GRIDSIZE[0];
    mousey = e.y / canvas.height * GRIDSIZE[1];
}