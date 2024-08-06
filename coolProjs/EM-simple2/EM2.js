const dot = (a, b) => a.reduce((p, c, i) => p + c * b[i], 0);

const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];

const vecLength = (v) => Math.sqrt(dot(v, v));

const PIXEL_SIZE = 5;
const MAX_FRAMES = 100;
const NEW_COEF_COUNT = 50;

const USE_GIF = false;

const GRIDSIZE = [200, 200, 3];

let maxValue;

let coef, coef2;

let fieldSize;
let ofield;
let field;
let dfield;

let noiseGrid = {};

const randomUnitVec = () => {
    const theta = Math.random() * Math.PI * 2;
    return [Math.cos(theta), Math.sin(theta)];
};

const smoothen = (x) => {
    if (x < 0) return smoothen(-x);
    if (x > 1) return 1;
    return 3 * x ** 2 - 2 * x ** 3;
};

const noise = (x, y, blocks) => {
    const blockWidth = GRIDSIZE[0] / blocks;
    const blockHeight = GRIDSIZE[1] / blocks;

    if (noiseGrid[blocks] === undefined) {
        noiseGrid[blocks] = Array(blocks ** 2)
            .fill()
            .map(() => randomUnitVec());
    }

    const gridX = Math.floor(x / blockWidth);
    const gridY = Math.floor(y / blockHeight);

    const vectors = Array(4)
        .fill()
        .map(
            (_, i) =>
                noiseGrid[blocks][
                    ((gridX + (i & 1)) % blocks) * blocks +
                        ((gridY + (i >> 1)) % blocks)
                ]
        );

    const displacements = Array(4)
        .fill()
        .map((_, i) => [
            x - (gridX + (i & 1)) * blockWidth,
            y - (gridY + (i >> 1)) * blockHeight,
        ]);

    // if (x <= 1 && y <= 1) console.log(gridX, gridY, vectors, displacements,);

    return vectors.reduce(
        (p, v, i) =>
            p +
            dot(v, displacements[i]) *
                (1 - smoothen(displacements[i][0] / blockWidth)) *
                (1 - smoothen(displacements[i][1] / blockHeight)),
        0
    );
};

const VALUERANGE = [0, 1];
const COEFRANGE = [-1, 1];
// const COEFCOUNTRANGE = [0, 20];
const TERMRANGE = [0, 1];
const DISTRANGE = [-1, 1];

let t = 0;

let targetMax = 10;

const init = () => {
    fieldSize = Math.round(GRIDSIZE.reduce((p, c) => p * c, 1));

    ofield = Array(fieldSize);
    field = Array(fieldSize);
    dfield = Array(fieldSize);

    noiseGrid = {};

    restart();
    makeNewCoefs();

    ctx.fillStyle = "black";

    ctx.fillRect(0, 0, canvas.width, canvas.height);
    t = 0;
};

let history = [];

const restart = () => {
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            for (let z = 0; z < GRIDSIZE[2]; z++) {
                const index = makeIdx(x, y, z);

                // field[index] = randrange(VALUERANGE);
                field[index] = 0;
                ofield[index] = field[index];
                // if (x === 0 && y === 0 && z === 0) field[index] = 1;
            }
            // field[index] = noise(x, y, 100) + noise(x, y, 50) + noise(x, y, 20) + noise(x, y, 10) + noise(x, y, 5);
        }
    }
    placeRandomDot();

    encoder.start();
    if (frame === MAX_FRAMES) {
        setTimeout(step, 1);
    }
    frame = 0;

    // coef = newCoef();
    // console.log(coef, history.length);
    // history.push(coef);
};

const makeNewCoefs = () => {
    coef = newCoef();
    console.log(coef);
    renderCoef();
};

const updateCoef = () => {
    coef2 = newCoef();
    coef.forEach((coeflist, i) => {
        coeflist.forEach((coefx, j) => {
            coefx.value = restrictRange(
                [-1, 1],
                coefx.value + 0.1 * coef2[i][j].value
            );
        });
    });
};

const renderCoef = () => {
    const controls = document.getElementById("controls");
    controls.innerHTML = "";

    // for (const [d, dimRules] of coef.entries()) {
    //     for (const [i, rule] of dimRules.entries()) {
    //         const newInput = document.createElement("input");
    //         newInput.type = "range";
    //         newInput.min = COEFRANGE[0];
    //         newInput.max = COEFRANGE[1];
    //         newInput.step = 0.01;
    //         newInput.value = rule.value;

    //         newInput.style.width = "50px";
    //         newInput.oninput = (e) => {
    //             rule.value = e.target.value;
    //         };
    //         // newInput.onchange = restart;

    //         controls.appendChild(newInput);
    //     }
    //     controls.insertAdjacentHTML("beforeend", "<hr/>");
    // }

    const randomizeButton = document.createElement("button");
    randomizeButton.onclick = restart;
    randomizeButton.innerText = "Randomize Field";
    controls.appendChild(randomizeButton);

    const randomizeButton2 = document.createElement("button");
    randomizeButton2.onclick = makeNewCoefs;
    randomizeButton2.innerText = "Randomize Coefficients";
    controls.appendChild(randomizeButton2);

    const randomizeButton3 = document.createElement("button");
    randomizeButton3.onclick = () => {
        makeNewCoefs();
        restart();
    };
    randomizeButton3.innerText = "Randomize Both";
    controls.appendChild(randomizeButton3);

    for (const activationFunction of activationFuncs) {
        const radio = document.createElement("input");
        radio.type = "radio";
        if (activationFunction.func === activationFunc) radio.checked = true;
        radio.name = "activationFunc";
        radio.onclick = () => {
            activationFunc = activationFunction.func;
        };
        controls.appendChild(radio);
        controls.insertAdjacentHTML("beforeend", activationFunction.name);
    }
};

const newCoef = () =>
    Array(3)
        .fill()
        .map(() => {
            const list = [];
            list.push({
                value: randrange(COEFRANGE),
                terms: [],
            });
            for (let i = 0; i < 3 ** 3; i++) {
                let dz = i % 3;
                let dy = ((i - dz) / 3) % 3;
                let dx = (i - dz - 3 * dy) / 9;
                list.push({
                    value: randrange(COEFRANGE),
                    terms: [{ dx: dx - 1, dy: dy - 1, dz: dz - 1, dt: 0 }],
                });

                list.push({
                    value: randrange(COEFRANGE),
                    terms: [{ dx: dx - 1, dy: dy - 1, dz: dz - 1, dt: 1 }],
                });
            }
            return list;
        });

const placeRandomDot = () => {
    const a = [
        Math.floor(Math.random() * GRIDSIZE[0]),
        Math.floor(Math.random() * GRIDSIZE[1]),
    ];
    Array(1)
        .fill()
        .forEach((_, x) => {
            Array(1)
                .fill()
                .forEach((_, y) => {
                    Array(3)
                        .fill()
                        .forEach((_, z) => {
                            field[makeIdx(a[0] + x, a[1] + y, z)] =
                                randrange(VALUERANGE);
                        });
                });
        });
};

const randrange = ([low, high]) => Math.random() * (high - low) + low;
const randrangeint = ([low, high]) =>
    Math.floor(Math.random() * (high - low + 1)) + low;

const getField = (x, y, z, dt = 0) => {
    // if (x < 0 || x >= GRIDSIZE[0] || y < 0 || y >= GRIDSIZE[1]) return 0;
    return (dt === 0 ? field : ofield)[makeIdx(x, y, z)];
};

// currently boundary condition wraps all fields
const makeIdx = (...pos) =>
    pos.reduce(
        (p, c, i) => GRIDSIZE[i] * p + ((c + 1000 * GRIDSIZE[i]) % GRIDSIZE[i]),
        0
    );

let currentMax = [1, 1, 1];
let currentMin = [0, 0, 0];

const step = () => {
    draw();
    frame++;

    const threshold = 0.1;
    let v = undefined;
    let found = false;

    currentMax = Array(3).fill(-Number.MAX_VALUE);
    currentMin = Array(3).fill(Number.MAX_VALUE);

    // Calculate derivatives
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            if (!found) {
                const k = [
                    field[makeIdx(x, y, 0)],
                    field[makeIdx(x, y, 1)],
                    field[makeIdx(x, y, 2)],
                ];
                if (v === undefined) v = k;
                else if (k.some((kv, i) => Math.abs(kv - v[i]) > threshold)) {
                    found = true;
                }
            }

            for (let z = 0; z < GRIDSIZE[2]; z++) {
                const index = makeIdx(x, y, z);

                dfield[index] = activationFunc(
                    coef[z].reduce(
                        (s, c) =>
                            s +
                            c.value *
                                c.terms.reduce(
                                    (p, f) =>
                                        p *
                                        getField(
                                            x + f.dx,
                                            y + f.dy,
                                            z + f.dz,
                                            f.dt
                                        ),
                                    1
                                ),
                        0
                    )
                );

                if (dfield[index] > currentMax[z])
                    currentMax[z] = dfield[index];
                if (dfield[index] < currentMin[z])
                    currentMin[z] = dfield[index];
            }
        }
    }

    if (!found) {
        console.log("All the same, restarting!");
        frame = 0;

        placeRandomDot();
        // makeNewCoefs();
        setTimeout(step, 1);
        return;
        // return restart();
    }

    //update
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            for (let z = 0; z < GRIDSIZE[2]; z++) {
                const index = makeIdx(x, y, z);

                ofield[index] = field[index];
                // field[index] = restrictRange(VALUERANGE, dfield[index]);
                field[index] = dfield[index];

                if (
                    !Number.isFinite(field[index]) ||
                    Number.isNaN(field[index])
                ) {
                    console.log("Nan!");
                    frame = MAX_FRAMES;
                    makeNewCoefs();
                    return restart();
                }
            }
        }
    }

    updateCoef();

    // const a = [
    //     Math.floor(Math.random() * GRIDSIZE[0]),
    //     Math.floor(Math.random() * GRIDSIZE[1]),
    // ];
    // // Make center dot 0
    // Array(1)
    //     .fill()
    //     .forEach((_, x) => {
    //         Array(1)
    //             .fill()
    //             .forEach((_, y) => {
    //                 Array(3)
    //                     .fill()
    //                     .forEach((_, z) => {
    //                         field[makeIdx(a[0] + x, a[1] + y, z)] = 0;
    //                     });
    //             });
    //     });

    // t++;
    // if (t % NEW_COEF_COUNT === 0) {
    //     t = 0;
    //     coef = newCoef();
    //     coef2 = newCoef();
    // }

    // if (USE_GIF) {
    //     encoder.addFrame(ctx);
    //     frame++;

    //     if (frame === MAX_FRAMES) {
    //         encoder.finish();
    //         encoder.download("yooooo.gif");

    //         encoder = new GIFEncoder();
    //         encoder.setRepeat(0);
    //         encoder.setDelay(1);
    //         encoder.start();
    //         frame = 0;
    //     }
    // }
    if (frame < MAX_FRAMES) setTimeout(step, 1);
    else {
        // encoder.finish();
        // encoder.download("yooooo.gif");
        // encoder.start();
        frame = 0;
        setTimeout(step, 1);
    }
};

let canvas, ctx;

const sigmoid = (x) => 1 / (1 + Math.exp(-x));
const invsigmoid = (y) => -Math.log(1 / y - 1);

const activationFuncs = [
    {
        name: "Cross Sigmoid",
        func: (x) => 1 - 4 * sigmoid(x) * (1 - sigmoid(x)),
    },
    { name: "Absolute tanh", func: (x) => Math.abs(Math.tanh(x / 2)) },
    { name: "Sigmoid", func: sigmoid },
    { name: "None", func: (x) => x },
];

let activationFunc = activationFuncs[0].func;

const restrictRange = ([min, max], x) => Math.max(min, Math.min(max, x));

const draw = () => {
    const boxWidth = Math.floor(canvas.width / GRIDSIZE[0]);
    const boxHeight = Math.floor(canvas.height / GRIDSIZE[1]);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            for (let px = 0; px < boxWidth; px++) {
                for (let py = 0; py < boxHeight; py++) {
                    const j =
                        4 *
                        (x * boxWidth +
                            px +
                            canvas.width * (y * boxWidth + py));

                    for (let z = 0; z < 3; z++) {
                        imageData.data[j + z] = Math.floor(
                            // ((field[makeIdx(x, y, z)] - currentMin[z]) /
                            //     (currentMax[z] - currentMin[z])) *
                            //     256
                            field[makeIdx(x, y, z)] * 256
                        );
                    }
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // encoder.addFrame(ctx);
};

window.onload = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    GRIDSIZE[0] = Math.floor(canvas.width / PIXEL_SIZE);
    GRIDSIZE[1] = Math.floor(canvas.height / PIXEL_SIZE);

    init();
    step();
    document.getElementById("hiddencontrols").onclick = () => {
        document.getElementById("controls").style.display =
            !document.getElementById("controls").style.display ||
            document.getElementById("controls").style.display === "block"
                ? "none"
                : "block";
    };
};
