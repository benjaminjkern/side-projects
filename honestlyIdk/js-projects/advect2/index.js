let canvas, ctx;

const XRANGE = 20;
const YRANGE = 15;

const DT = 0.01;

const boxes = [];

const createBox = (x, y, size) => {
    boxes.push([
        [x, y],
        [x, y + size],
        [x + size, y + size],
        [x + size, y],
    ]);
};

const createMesh = (xmin, xmax, ymin, ymax, grids) => {
    for (let i = 0; i < grids; i++) {
        for (let j = 0; j < grids; j++) {
            createBox(
                xmin + (i * (xmax - xmin)) / grids,
                ymin + (j * (ymax - ymin)) / grids,
                1 / grids
            );
        }
    }
};

createMesh(0, 1, 0, 1, 1);
window.onload = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    draw();
    startLoop();
};

const startLoop = () => {
    nextFrame();
    setTimeout(startLoop, 1);
};

const d2t = (x, v) => -x;
const d3t = (x, v) => -v;
const d4t = (x, v) => x;

const nextFrame = () => {
    for (const box of boxes) {
        for (const [i, [x, v]] of box.entries()) {
            box[i] = [
                x + v * DT + (1 / 2) * DT ** 2 * d2t(x, v),
                v + DT * d2t(x, v),
            ];
        }
    }
    draw();
};

const virtualToScreenCoords = ([x, y]) => {
    return [
        canvas.width / 2 + ((x / XRANGE) * canvas.width) / 2,
        canvas.height / 2 - ((y / YRANGE) * canvas.height) / 2,
    ];
};

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "red";
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    for (const box of boxes) {
        ctx.beginPath();
        ctx.moveTo(...virtualToScreenCoords(box.slice(-1)[0]));
        for (const point of box) {
            ctx.lineTo(...virtualToScreenCoords(point));
        }
        ctx.stroke();
        ctx.fill();
    }
};
