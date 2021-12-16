const dot = (a, b) => a.reduce((p, c, i) => p + c * b[i], 0);

const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];

const vecLength = (v) => Math.sqrt(dot(v, v));

const PIXEL_SIZE = 7;
const MAX_FRAMES = 500;

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
const COEFRANGE = [0, 20];
const TERMRANGE = [0, 10];
const DISTRANGE = [-5, 5];

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

    coef = Array(3).fill().map(() => Array(randrangeint(COEFRANGE)).fill().map(() => ({
        value: randrange(VALUERANGE),
        terms: Array(randrangeint(TERMRANGE)).fill().map(() => ({
            dx: randrangeint(DISTRANGE),
            dy: randrangeint(DISTRANGE),
            dz: randrangeint(DISTRANGE)
        }))
    })));

    ctx.fillStyle = 'black';

    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const randrange = ([low, high]) => Math.random() * (high - low) + low;
const randrangeint = ([low, high]) => Math.floor(Math.random() * (high - low + 1)) + low;

const getField = (x, y, z) => {
    // if (x < 0 || x >= GRIDSIZE[0] || y < 0 || y >= GRIDSIZE[1]) return 0;
    return field[makeIdx(x, y, z)];
}

// currently boundary condition wraps all fields
const makeIdx = (...pos) => pos.reduce((p, c, i) => GRIDSIZE[i] * p + (c + 1000 * GRIDSIZE[i]) % GRIDSIZE[i], 0);

const step = () => {

    // Calculate derivatives
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            for (let z = 0; z < GRIDSIZE[2]; z++) {
                dfield[makeIdx(x, y, z)] = coef[z].reduce((s, c) => s + c.value * c.terms.reduce((p, f) => p * getField(x + f.dx, y + f.dy, z + f.dz), 1), 0);

                // console.log(dfield[makeIdx(x, y, z)]);
                // set update values
                // if (mousedown) {
                //     const pm = [x - mousex, y - mousey];
                //     const pl = [x - lastmousex, y - lastmousey];
                //     const diff = [mousex - lastmousex, mousey - lastmousey];
                //     if (dot(pl, diff) > 0 && dot(pm, diff) < 0) {
                //         const projLength = dot(pl, diff) / dot(diff, diff);
                //         const orth = [pl[0] - projLength * diff[0], pl[1] - projLength * diff[1]];
                //         if (orth[0] ** 2 + orth[1] ** 2 < radius ** 2) dfield[makeIdx(x, y, z)] = mousevalue[z];
                //     } else if ((x - mousex) ** 2 + (y - mousey) ** 2 < radius ** 2 || (x - lastmousex) ** 2 + (y - lastmousey) ** 2 < radius ** 2) dfield[makeIdx(x, y, z)] = mousevalue[z];

                // }
            }
        }
    }

    // maxValue = 0;

    //update
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            for (let z = 0; z < GRIDSIZE[2]; z++) {
                const index = makeIdx(x, y, z);

                field[index] = Math.max(VALUERANGE[0], Math.min(VALUERANGE[1], dfield[index]));

                if (Number.isNaN(field[index])) {
                    console.log(coef);
                    return;
                }
            }
        }
    }

    // console.log(field[Math.floor(Math.random() * field.length)]);


    // field[Math.floor(Math.random() * field.length)] = randrange(VALUERANGE);
    Array(3).fill().forEach((_, x) => {
        Array(3).fill().forEach((_, y) => {
            Array(3).fill().forEach((_, z) => { field[makeIdx(Math.floor(GRIDSIZE[0] / 2) + x - 1, Math.floor(GRIDSIZE[1] / 2) + y - 1, z)] = Math.random() * 2 - 1 });
        })
    });

    const MUTATE = 0.1;

    // change the coef slightly
    const newCoefList = coef[Math.floor(Math.random() * coef.length)];
    if (Math.random() < MUTATE && newCoefList.length < COEFRANGE[1]) {
        // console.log("Adding new coeficient")
        newCoefList.push({
            value: randrange(VALUERANGE),
            terms: Array(randrangeint(TERMRANGE)).fill().map(() => ({
                dx: randrangeint(DISTRANGE),
                dy: randrangeint(DISTRANGE),
                dz: randrangeint(DISTRANGE)
            }))
        });
    }
    if (Math.random() < MUTATE && newCoefList.length > COEFRANGE[0]) {
        // console.log("Removing coeficient")
        newCoefList.splice(Math.floor(Math.random() * newCoefList.length), 1);
    }
    const newCoef = newCoefList[Math.floor(Math.random() * newCoefList.length)];
    if (newCoef) {
        if (Math.random() < MUTATE) {
            // console.log("Changing coeficient")
            newCoef.value = Math.max(VALUERANGE[0], Math.min(VALUERANGE[1], newCoef.value + MUTATE * randrange(VALUERANGE)));
        }
        if (Math.random() < MUTATE && newCoef.terms.length < TERMRANGE[1]) {
            // console.log("Adding new term")
            newCoef.terms.push({
                dx: randrangeint(DISTRANGE),
                dy: randrangeint(DISTRANGE),
                dz: randrangeint(DISTRANGE)
            });
        }
        if (Math.random() < MUTATE && newCoef.terms.length > TERMRANGE[0]) {
            // console.log("Removing term")
            newCoef.terms.splice(Math.floor(Math.random() * newCoef.terms.length), 1);
        }
        if (Math.random() < MUTATE) {
            // console.log("Changing Term")
            const newTerm = newCoef.terms[Math.floor(Math.random() * newCoef.terms.length)];
            if (newTerm) {
                const r = Math.random();
                if (r > 2 / 3)
                    newTerm.dx = Math.max(DISTRANGE[0], Math.min(DISTRANGE[1], newTerm.dx + randrangeint([-1, 1])));
                else if (r > 1 / 3)
                    newTerm.dy = Math.max(DISTRANGE[0], Math.min(DISTRANGE[1], newTerm.dy + randrangeint([-1, 1])));
                else
                    newTerm.dz = Math.max(DISTRANGE[0], Math.min(DISTRANGE[1], newTerm.dz + randrangeint([-1, 1])));
            }
        }
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
    // console.log(maxValue);
};

let canvas, ctx;

const sigmoid = (x) => 1 / (1 + Math.exp(-x));

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
                        imageData.data[j + z] = Math.floor((field[makeIdx(x, y, z)] + 1) / 2 * 256);
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

    // GRIDSIZE[0] = canvas.width;
    // GRIDSIZE[1] = canvas.height;

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
    mousevalue = [randrange(VALUERANGE), randrange(VALUERANGE), randrange(VALUERANGE)];
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