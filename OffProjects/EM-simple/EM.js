const dot = (a, b) => a.reduce((p, c, i) => p + c * b[i], 0);

const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];

const vecLength = (v) => Math.sqrt(dot(v, v));

const PIXEL_SIZE = 7;
const MAX_FRAMES = 500;
const NEW_COEF_COUNT = 50;

const USE_GIF = false;

let frame = 0;
let encoder = new GIFEncoder();
encoder.setRepeat(0);
encoder.setDelay(1);
encoder.start();

const GRIDSIZE = [200, 200, 3];

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
const COEFRANGE = [-1, 1];
// const COEFCOUNTRANGE = [0, 20];
const TERMRANGE = [0, 1];
const DISTRANGE = [-1, 1];

let t = 0;

let targetMax = 10;

const init = () => {

    fieldSize = Math.round(GRIDSIZE.reduce((p, c) => p * c, 1));

    field = Array(fieldSize);
    dfield = Array(fieldSize);

    noiseGrid = {};

    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            for (let z = 0; z < GRIDSIZE[2]; z++) {
                const index = makeIdx(x, y, z);

                field[index] = randrange(VALUERANGE);
            }
            // field[index] = noise(x, y, 100) + noise(x, y, 50) + noise(x, y, 20) + noise(x, y, 10) + noise(x, y, 5);
        }
    }

    coef = newCoef();

    ctx.fillStyle = 'black';

    ctx.fillRect(0, 0, canvas.width, canvas.height);
    t = 0;
}

const newCoef = () =>
    Array(3).fill().map(() => {
        const a = randrange(COEFRANGE);
        return [{
            value: randrange(COEFRANGE),
            terms: []
        }, {
            value: randrange(COEFRANGE),
            terms: [{ dx: 0, dy: 0, dz: 0 }]
        }, {
            value: a,
            terms: [{ dx: 1, dy: 0, dz: 0 }]
        }, {
            value: a,
            terms: [{ dx: -1, dy: 0, dz: 0 }]
        }, {
            value: a,
            terms: [{ dx: 0, dy: 1, dz: 0 }]
        }, {
            value: a,
            terms: [{ dx: 0, dy: -1, dz: 0 }]
        }, {
            value: randrange(COEFRANGE),
            terms: [{ dx: 0, dy: 0, dz: 1 }]
        }, {
            value: randrange(COEFRANGE),
            terms: [{ dx: 0, dy: 0, dz: -1 }]
        }];
    });

const randrange = ([low, high]) => Math.random() * (high - low) + low;
const randrangeint = ([low, high]) => Math.floor(Math.random() * (high - low + 1)) + low;

const getField = (x, y, z) => {
    // if (x < 0 || x >= GRIDSIZE[0] || y < 0 || y >= GRIDSIZE[1]) return 0;
    return field[makeIdx(x, y, z)];
}

// currently boundary condition wraps all fields
const makeIdx = (...pos) => pos.reduce((p, c, i) => GRIDSIZE[i] * p + (c + 1000 * GRIDSIZE[i]) % GRIDSIZE[i], 0);

const step = () => {
    let currentMax = 0;

    // Calculate derivatives
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            for (let z = 0; z < GRIDSIZE[2]; z++) {
                const index = makeIdx(x, y, z)
                dfield[index] = coef[z].reduce((s, c) => s + c.value * c.terms.reduce((p, f) => p * getField(x + f.dx, y + f.dy, z + f.dz), 1), 0);

                currentMax = Math.max(currentMax, Math.abs(field[index]));
            }
        }
    }

    //update
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            for (let z = 0; z < GRIDSIZE[2]; z++) {
                const index = makeIdx(x, y, z);

                field[index] = restrictRange(VALUERANGE, dfield[index]);

                if (Number.isNaN(field[index])) {
                    console.log(coef);
                    return;
                }
            }
        }
    }

    Array(1).fill().forEach((_, x) => {
        Array(1).fill().forEach((_, y) => {
            Array(3).fill().forEach((_, z) => { field[makeIdx(Math.floor(GRIDSIZE[0] / 2) + x, Math.floor(GRIDSIZE[1] / 2) + y, z)] = 0 });
        })
    });

    t++;
    if (t % NEW_COEF_COUNT === 0) {
        t = 0;
        coef = newCoef();
    }

    draw();

    if (USE_GIF) {
        encoder.addFrame(ctx);
        frame++;

        if (frame === MAX_FRAMES) {
            encoder.finish();
            encoder.download("yooooo.gif");

            encoder = new GIFEncoder();
            encoder.setRepeat(0);
            encoder.setDelay(1);
            encoder.start();
            frame = 0;
        }
    }
    setTimeout(step, 1);
};

let canvas, ctx;

const sigmoid = (x) => 1 / (1 + Math.exp(-x));
const invsigmoid = (y) => -Math.log(1 / y - 1);

const restrictRange = ([min, max], x) => Math.max(min, Math.min(max, x));

const draw = () => {
    const boxWidth = Math.floor(canvas.width / GRIDSIZE[0]);
    const boxHeight = Math.floor(canvas.height / GRIDSIZE[1]);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            for (let px = 0; px < boxWidth; px++) {
                for (let py = 0; py < boxHeight; py++) {
                    const j = 4 * ((x * boxWidth + px) + canvas.width * (y * boxWidth + py));

                    for (let z = 0; z < 3; z++) {
                        imageData.data[j + z] = Math.floor(sigmoid(field[makeIdx(x, y, z)]) * 256);
                    }
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

window.onload = () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;


    GRIDSIZE[0] = Math.floor(canvas.width / PIXEL_SIZE);
    GRIDSIZE[1] = Math.floor(canvas.height / PIXEL_SIZE);

    init();
    step();
}

let mousedown = false;
let mousex;
let mousey;

let lastmousex;
let lastmousey;

let mousevalue;