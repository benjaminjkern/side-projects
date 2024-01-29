let canvas, ctx;

const XRANGE = 5;
let YRANGE;

const DT = 0.01;
const DX = 0.1;
const DV = 0.1;

const grid = [];
const newGrid = [];

window.onload = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    YRANGE = (XRANGE * canvas.height) / canvas.width;
    for (
        let v = -Math.ceil(YRANGE), j = 0;
        v < Math.ceil(YRANGE);
        v += DV, j++
    ) {
        grid.push([]);
        for (
            let x = -Math.ceil(XRANGE), i = 0;
            x < Math.ceil(XRANGE);
            x += DX, i++
        ) {
            if (Math.abs(x - DX) < DX / 2 && Math.abs(v - DV) < DV / 2)
                grid[j].push(1);
            else grid[j].push(0);
        }
    }

    draw();
    startLoop();
};

const startLoop = () => {
    nextFrame();
    setTimeout(startLoop, 1);
};

const d2t = (x, v) => -x;

const nextFrame = () => {
    for (
        let v = -Math.ceil(YRANGE), j = 0;
        v < Math.ceil(YRANGE);
        v += DV, j++
    ) {
        for (
            let x = -Math.ceil(XRANGE), i = 0;
            x < Math.ceil(XRANGE);
            x += DX, i++
        ) {
            // Need to move all corners and then the new value is the proportion of the new box that is in this box
        }
    }
    for (
        let v = -Math.ceil(YRANGE), j = 0;
        v < Math.ceil(YRANGE);
        v += DV, j++
    ) {
        for (
            let x = -Math.ceil(XRANGE), i = 0;
            x < Math.ceil(XRANGE);
            x += DX, i++
        ) {
            grid[j][i] = newGrid[j][i];
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
    for (
        let x = -Math.ceil(XRANGE), i = 0;
        x < Math.ceil(XRANGE);
        x += DX, i++
    ) {
        for (
            let v = -Math.ceil(YRANGE), j = 0;
            v < Math.ceil(YRANGE);
            v += DV, j++
        ) {
            ctx.fillStyle = `rgba(255, 0, 0, ${grid[j][i]})`;
            ctx.beginPath();
            ctx.moveTo(...virtualToScreenCoords([x, v]));
            ctx.lineTo(...virtualToScreenCoords([x + DX, v]));
            ctx.lineTo(...virtualToScreenCoords([x + DX, v + DV]));
            ctx.lineTo(...virtualToScreenCoords([x, v + DV]));
            ctx.lineTo(...virtualToScreenCoords([x, v]));
            ctx.fill();
        }
    }
};
