// MATH
const dot = (a, b) => a.reduce((p, c, i) => p + c * b[i], 0);

const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];

const vecLength = (v) => Math.sqrt(dot(v, v));

const sumVecs = (a, ...b) => {
    if (!b.length) return a;
    const sumb = sumVecs(...b);
    return a.map((ax, i) => ax + sumb[i]);
}

// LOGIC
const _root = {};

window.onload = () => {
    canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    _root.ctx = canvas.getContext('2d');
    _root.screenSize = [canvas.width, canvas.height];

    init();
    const loop = (frame) => {
        if (step(frame)) draw();
        setTimeout(() => loop(frame + 1), 1);
    }
    loop(0);
}

// TEMPLATE
const init = () => {
    _root.origin = [0, 0];
    _root.domain = [[-1, 1], [-1, 1]];
    _root.ctx.fillStyle = "#ffffff"
    _root.ctx.fillRect(0, 0, ..._root.screenSize);

    _root.N = 10;
};

const step = (frame) => {
    newA();

    _root.color = Array(3).fill().map(() => Math.floor(Math.random() * 255));
    return true;
};

const draw = () => {
    const grid = Array(_root.screenSize[1] + 1).fill().map(() => Array(_root.screenSize[0] + 1))
    for (let sx = 0; sx <= _root.screenSize[0]; sx++) {
        for (let sy = 0; sy <= _root.screenSize[1]; sy++) {
            grid[sy][sx] = func(screenToVirtual([sx, sy])) > 0;
        }
    }

    const imageData = _root.ctx.getImageData(0, 0, ..._root.screenSize);

    for (let sx = 0; sx < _root.screenSize[0]; sx++) {
        for (let sy = 0; sy < _root.screenSize[1]; sy++) {
            const u0 = grid[sy][sx];
            const u1 = grid[sy + 1][sx];
            const u2 = grid[sy][sx + 1];
            const u3 = grid[sy + 1][sx + 1];
            const sum = u0 + u1 + u2 + u3;
            if (sum === 0 || sum === 4) continue;
            const j = 4 * (sx + _root.screenSize[0] * sy);

            for (let z = 0; z < 3; z++) {
                imageData.data[j + z] = _root.color[z];
            }
            imageData.data[j + 4] = 255;
        }
    }
    _root.ctx.putImageData(imageData, 0, 0);
};

// Helpers
const screenToVirtual = (s) => sumVecs(s.map((sx, i) => sx / _root.screenSize[i] * (_root.domain[i][1] - _root.domain[i][0])), _root.origin, [_root.domain[0][0], _root.domain[1][0]]);

const func = ([x, y]) => _root.A.reduce((sum, row, n) => sum + row.reduce((rowsum, a, m) => rowsum + a * (x ** n) * (y ** m), 0), 0);

const newA = () => {
    _root.A = Array(_root.N + 1).fill().map((_, n) => Array(_root.N + 1 - n).fill().map(() => Math.random() * 2 - 1));
    // console.log(_root.A);
}