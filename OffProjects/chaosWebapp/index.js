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
};

const neededSumVecs = ([a, b, c, A]) => [sumVecs(a, b, c), A];

// LOGIC
const _root = {};

const reset = () => {
    if (_root.process) clearTimeout(_root.process);
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    document.body.onclick = reset;
    window.onresize = reset;

    _root.ctx = canvas.getContext("2d");
    _root.screenSize = [canvas.width, canvas.height];

    init();
    const loop = async (frame) => {
        if (step(frame)) await draw();
        _root.process = setTimeout(() => loop(frame + 1), 1);
    };
    loop(0);
};

// TEMPLATE
const init = () => {
    _root.origin = [0, 0];
    _root.domain = [
        [-1, 1],
        [-1, 1],
    ];
    _root.ctx.fillStyle = "#ffffff";
    _root.ctx.fillRect(0, 0, ..._root.screenSize);

    _root.grid = Array(_root.screenSize[1] + 1)
        .fill()
        .flatMap((_1, sx) =>
            Array(_root.screenSize[0] + 1)
                .fill()
                .map((_2, sy) => [sx, sy])
        );

    _root.N = 10;
};

const step = (frame) => {
    newA();

    _root.color = Array(3)
        .fill()
        .map(() => Math.floor(Math.random() * 255));
    return true;
};

const draw = async () => {
    const p = new Parallel(_root.grid, { env: { func, screenToVirtual } });

    const grid = await p
        .map(screenToVirtual)
        .map(neededSumVecs)
        .map(func)
        .map((v) => v > 0);

    const imageData = _root.ctx.getImageData(0, 0, ..._root.screenSize);

    for (const [i, u0] of grid.entries()) {
        const sx = Math.floor(i, _root.screenSize[1] + 1),
            sy = i % (_root.screenSize[1] + 1);
        const u1 = grid[(sx + 1) * (_root.screenSize[1] + 1) + sy];
        const u2 = grid[sx * (_root.screenSize[1] + 1) + (sy + 1)];
        const u3 = grid[(sx + 1) * (_root.screenSize[1] + 1) + (sy + 1)];
        const sum = u0 + u1 + u2 + u3;
        if (sum === 0 || sum === 4) continue;
        const j = 4 * (sx + _root.screenSize[0] * sy);

        for (let z = 0; z < 3; z++) {
            imageData.data[j + z] = _root.color[z];
        }
        imageData.data[j + 4] = 255;
    }
    _root.ctx.putImageData(imageData, 0, 0);
};

// Helpers
const screenToVirtual = ([s, A]) => [
    s.map(
        (sx, i) =>
            (sx / _root.screenSize[i]) *
            (_root.domain[i][1] - _root.domain[i][0])
    ),
    _root.origin,
    [_root.domain[0][0], _root.domain[1][0]],
    A,
];

const func = ([x, y, A]) =>
    A.reduce(
        (sum, row, n) =>
            sum + row.reduce((rowsum, a, m) => rowsum + a * x ** n * y ** m, 0),
        0
    );

const newA = () => {
    _root.A = Array(_root.N + 1)
        .fill()
        .map((_, n) =>
            Array(_root.N + 1 - n)
                .fill()
                .map(() => Math.random() * 2 - 1)
        );
};

window.onload = reset;
