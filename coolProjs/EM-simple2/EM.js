const GRID_SIZE = 100;
const PIXEL_SIZE = 5;

let canvas, ctx;

const newField = (start) => {
    if (typeof start === "function")
        return Array(GRID_SIZE)
            .fill()
            .map((_, y) =>
                Array(GRID_SIZE)
                    .fill()
                    .map((_, x) => start(x, y))
            );
    return Array(GRID_SIZE)
        .fill()
        .map(() => Array(GRID_SIZE).fill(start));
};

const field = newField(() => Math.random() * 2 - 1);

window.onload = () => {
    canvas = document.getElementById("canvas");
    canvas.width = GRID_SIZE * PIXEL_SIZE;
    canvas.height = GRID_SIZE * PIXEL_SIZE;
    ctx = canvas.getContext("2d");
    loop();
};

const loop = () => {
    draw();
    setTimeout(loop, 1);
    evolve();
};

const bigmoid = (x) => {
    const s = 1;
    return 1 - 1 / (1 + s * x ** 2);
};

const nicemod = (x, m) => {
    if (x < 0) return ((x % m) + m) % m;
    return x % m;
};

const getValue = (x, y) => {
    return field[nicemod(y, GRID_SIZE)][nicemod(x, GRID_SIZE)];
};

const evolve = () => {
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            field[y][x] += Math.random() * 2 - 1;
        }
    }
};

const draw = () => {
    const imageData = ctx.getImageData(
        0,
        0,
        GRID_SIZE * PIXEL_SIZE,
        GRID_SIZE * PIXEL_SIZE
    );
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let px = 0; px < PIXEL_SIZE; px++) {
                for (let py = 0; py < PIXEL_SIZE; py++) {
                    const j =
                        4 *
                        (x * PIXEL_SIZE +
                            px +
                            GRID_SIZE * PIXEL_SIZE * (y * PIXEL_SIZE + py));

                    imageData.data[j] =
                        bigmoid(Math.max(0, getValue(x, y))) * 256;
                    imageData.data[j + 1] = 0;
                    imageData.data[j + 2] =
                        bigmoid(Math.max(0, -getValue(x, y))) * 256;
                    imageData.data[j + 3] = 255;
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
};
