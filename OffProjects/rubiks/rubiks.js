const _root = {};

window.onload = () => {
    _root.canvas = document.getElementById("canvas");
    _root.ctx = _root.canvas.getContext("2d");

    restart();
};

const restart = () => {
    constants();
    init();
    clearTimeout(_root.running);
    const loop = () => {
        calc();
        draw();
        if (!_root.stopped) _root.running = setTimeout(loop, 1);
    };
    loop();
};

const constants = () => {
    _root.N = 3;
};

const init = () => {
    _root.cube = [];
    for (let d = 0; d < 3; d++) {
        for (let vx = 0; vx < _root.N; vx++) {
            for (let vy = 0; vy < _root.N; vy++) {
                const pos = [vx - (_root.N - 1) / 2, vy - (_root.N - 1) / 2];
                newVec(pos, d, 0);
                newVec(pos, d, 1);
            }
        }
    }

    console.log(_root.cube);
};

const calc = () => {};

const draw = () => {};

/**
 * UHH
 */

const newVec = (pos, d, offset) => {
    const newOffset = (-1) ** offset;
    const newPos = [...pos];
    newPos.splice(d, 0, newOffset);

    _root.cube.push({
        color: 2 * d + offset,
        pos: newPos,
        u: Array(3)
            .fill(0)
            .map((a, i) => (i === d ? newOffset : a)),
    });
};

const turn = (u, theta, n = 1) => {
    if (theta === 0) return;
    while (theta > 1) {
        turn(u, 1, n);
        theta--;
    }
    for (const point of _root.cube) {
        if (dot(point.pos, u) > 1 - (2 * n) / _root.N) {
        }
    }
};

const dot = (a, b) => a.reduce((x, i) => x * b[i], 0);
