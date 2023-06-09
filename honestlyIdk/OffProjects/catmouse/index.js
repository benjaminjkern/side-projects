const _root = {};

window.onload = () => {
    _root.canvas = document.getElementById("canvas");
    _root.ctx = _root.canvas.getContext("2d");

    _root.canvas.width = window.innerWidth;
    _root.canvas.height = window.innerHeight;
    _root.screenSize = [_root.canvas.width, _root.canvas.height];

    restart();
};

window.onclick = (e) => {
    resetPos(screenToVirtual([e.x, e.y]));
    _root.n = 0;
};

const resetPos = (pos) => {
    _root.x = pos;
    _root.mx = pos;
    _root.y = pos;
    _root.my = pos;
};

const randomCirclePos = () => {
    let p;
    while (!p || lengthSquared(p, p) > 1)
        p = Array(2)
            .fill()
            .map(() => 2 * Math.random() - 1);
    return p;
};

const restart = () => {
    constants();
    init();
    clearTimeout(_root.running);
    const loop = () => {
        calc();
        draw();
        _root.stopped = true;
        if (_root.stopped) return;

        if (_root.n % _root.pause === 0) {
            if (_root.n % (_root.loops * _root.pause) === 0) {
                resetPos(randomCirclePos());
            }
            _root.running = setTimeout(loop, 1);
        } else loop();
    };
    loop();
};

const constants = () => {
    const ratio = _root.screenSize[0] / _root.screenSize[1];
    const scale = 1.5;
    _root.domain = [
        [-scale * ratio, scale * ratio],
        [-scale, scale],
    ];
    _root.t = 0;
    const NUM_T = 100;
    _root.tRange = Array(NUM_T)
        .fill()
        .map((_, i) => (i / NUM_T) * 2 * Math.PI);
};

const init = () => {};

const calc = () => {};

const draw = () => {
    _root.ctx.beginPath();

    _root.ctx.arc(
        _root.canvas.width / 2,
        _root.canvas.height / 2,
        _root.canvas.height / 4,
        0,
        2 * Math.PI
    );

    _root.ctx.stroke();
    _root.ctx.closePath();

    const imageData = _root.ctx.getImageData(
        0,
        0,
        _root.canvas.width,
        _root.canvas.height
    );
    for (let x = 0; x < _root.canvas.width; x++) {
        for (let y = 0; y < _root.canvas.height; y++) {
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
};

const screenToVirtual = (s) =>
    s.map(
        (sx, i) =>
            ((sx / _root.screenSize[i]) *
                (_root.domain[i][1] - _root.domain[i][0]) +
                _root.domain[i][0]) *
            (-1) ** i
    );

const virtualToScreen = (v) =>
    v.map(
        (vx, i) =>
            ((vx * (-1) ** i - _root.domain[i][0]) * _root.screenSize[i]) /
            (_root.domain[i][1] - _root.domain[i][0])
    );

/****
 * MATH
 */

const epsilon = 0.01;

const s =
    (n) =>
    ([x, y]) => {
        if (n === 0) return Math.abs(1 - Math.sqrt(x ** 2 + y ** 2)) < epsilon;
        const sn = s(n - 1);
    };

/**
 *
 * COMPLEX
 */

const compMult = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c];

const compAdd = (...a) => addVec(...a);

const dot = (a, b) => a.reduce((p, x, i) => p + x * b[i], 0);

const lengthSquared = (v) => dot(v, v);

const cross = ([ax, ay, az], [bx, by, bz]) => [
    ay * bz - az * by,
    az * bx - ax * bz,
    ax * by - ay * bx,
];

const multVec = (a, v) => v.map((x) => x * a);
const subVec = (a, b) => a.map((x, i) => x - b[i]);
const addVec = (a, ...rest) => {
    if (rest.length === 0) return a;
    const restSum = addVec(...rest);
    return a.map((x, i) => x + restSum[i]);
};

const matMult = (matrix, vector) => {
    return matrix.map((row) => dot(row, vector));
};

const makeUnitVec = (vector) => {
    const length = Math.sqrt(dot(vector, vector));
    return vector.map((a) => a / length);
};

const makeRotationMatrix = (u, theta) => {
    const sin = Math.sin(theta);
    const cos = Math.cos(theta);
    return [
        [
            cos + u[0] * u[0] * (1 - cos),
            u[0] * u[1] * (1 - cos) - u[2] * sin,
            u[0] * u[2] * (1 - cos) + u[1] * sin,
        ],
        [
            u[0] * u[1] * (1 - cos) + u[2] * sin,
            cos + u[1] * u[1] * (1 - cos),
            u[1] * u[2] * (1 - cos) - u[0] * sin,
        ],
        [
            u[0] * u[2] * (1 - cos) - u[1] * sin,
            u[1] * u[2] * (1 - cos) + u[0] * sin,
            cos + u[2] * u[2] * (1 - cos),
        ],
    ];
};
