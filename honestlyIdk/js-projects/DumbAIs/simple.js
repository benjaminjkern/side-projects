import { mutateBrain, newBrain, resetBrain, runBrain } from "./modules/AI.js";

let ctx;

let PIXEL_SIZE = 20;
const DOT_COUNT = 10;
const MODEL_COUNT = 100;
const INSTRUCTIONS_RUN_PER_FRAME = 500;
const dots = [];
const models = [];

window.onload = () => {
    const canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init();
    loop();
};

const newModel = (brain) => {
    return { brain: brain || newBrain({ IOSIZE: 3 }) };
};

const init = () => {
    Array(DOT_COUNT)
        .fill()
        .map(() =>
            dots.push({
                pos: [
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight,
                ],
                color: Array(3)
                    .fill()
                    .map(() => Math.random() * 255),
            })
        );
    Array(MODEL_COUNT)
        .fill()
        .map(() => models.push(newModel()));
};

const runModel = (model, pos) => {
    resetBrain(model.brain);
    model.brain.inputData = [...pos, 1];
    runBrain(model.brain, INSTRUCTIONS_RUN_PER_FRAME);
    return model.brain.outputData;
};

const loop = () => {
    train();
    draw();
    setTimeout(loop, 1);
};

const train = () => {
    models.forEach((model) => {
        model.loss = 0;
        dots.forEach((dot) => {
            const output = runModel(model, dot.pos);
            model.loss += dot.color.reduce(
                (p, c, i) => p + (c - output[i]) ** 2,
                0
            );
        });
    });

    models.sort((a, b) => a.loss - b.loss);
    models.splice(models.length / 2);
    models.forEach((model) => models.push(newModel(mutateBrain(model.brain))));
    console.log(models[0].loss);
};

const cssColor = (color) => `rgb(${color.join(",")})`;

const draw = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let x = 0; x < window.innerWidth; x += PIXEL_SIZE) {
        for (let y = 0; y < window.innerHeight; y += PIXEL_SIZE) {
            ctx.fillStyle = cssColor(runModel(models[0], [x, y]));
            ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
        }
    }
    for (const dot of dots) {
        ctx.fillStyle = cssColor(dot.color);
        ctx.beginPath();
        ctx.arc(...dot.pos, 5, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }
};

window.onkeydown = () => {
    PIXEL_SIZE = 1;
};

window.onkeyup = () => {
    PIXEL_SIZE = 20;
};
