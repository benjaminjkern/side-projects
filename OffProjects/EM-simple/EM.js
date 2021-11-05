const dot = (a, b) => a.reduce((p, c, i) => p + c * b[i], 0);

const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];

const vecLength = (v) => Math.sqrt(dot(v, v));

const GRIDSIZE = [250, 250];

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

const init = () => {

    fieldSize = Math.round(GRIDSIZE.reduce((p, c) => p * c, 1));

    field = Array(fieldSize);
    dfield = Array(fieldSize);

    noiseGrid = {};

    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            const index = makeIdx(x, y);

            field[index] = noise(x, y, 100) + noise(x, y, 50) + noise(x, y, 20) + noise(x, y, 10) + noise(x, y, 5);
        }
    }
    coef = [
        { value: Math.random() * 2 - 1, terms: [] },
        { value: Math.random() * 2 - 1, terms: [{ dx: 0, dy: 0, power: 1 }] },

        { value: Math.random() * 2 - 1, terms: [{ dx: 1, dy: 0, power: 1 }] },
        { value: Math.random() * 2 - 1, terms: [{ dx: -1, dy: 0, power: 1 }] },
        { value: Math.random() * 2 - 1, terms: [{ dx: 0, dy: 1, power: 1 }] },
        { value: Math.random() * 2 - 1, terms: [{ dx: 0, dy: -1, power: 1 }] },

        // { value: Math.random() * 2 - 1, terms: [{ dx: 1, dy: 1, power: 1 }] },
        // { value: Math.random() * 2 - 1, terms: [{ dx: 1, dy: -1, power: 1 }] },
        // { value: Math.random() * 2 - 1, terms: [{ dx: -1, dy: 1, power: 1 }] },
        // { value: Math.random() * 2 - 1, terms: [{ dx: -1, dy: -1, power: 1 }] },
    ];

    console.log(coef);
    // coef = [{ value: 1, terms: [{ dx: 1, dy: 1, power: 1 }] },];
}

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
                if ((x - mousex) ** 2 + (y - mousey) ** 2 < radius ** 2 || (x - lastmousex) ** 2 + (y - lastmousey) ** 2 < radius ** 2) dfield[makeIdx(x, y)] = mousevalue;
            }
        }
    }

    maxValue = 0;

    //update
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            const index = makeIdx(x, y);

            field[index] = dfield[index];

            maxValue = Math.max(field[index], maxValue, -maxValue);
        }
    }

    draw();

    requestAnimationFrame(step);
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
            const value = Math.floor(sigmoid(field[makeIdx(x, y)] / maxValue) * 256);

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


    GRIDSIZE[0] = Math.round(canvas.width / 4);
    GRIDSIZE[1] = Math.round(canvas.height / 4);

    init();
    step();
}

let mousedown = false;
let mousex;
let mousey;

let lastmousex;
let lastmousey;

let mousevalue;

const radius = 10;

document.onkeydown = init;

document.onmousedown = () => {
    mousevalue = (Math.random() * 2 - 1) * maxValue;
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