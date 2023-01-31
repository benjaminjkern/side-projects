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
        if (!_root.stopped && _root.n % _root.pause === 0) {
            if (_root.n % (_root.loops * _root.pause) === 0) {
                resetPos(randomCirclePos());
            }
            _root.running = setTimeout(loop, 1);
        } else loop();
    };
    loop();
};

const constants = () => {
    _root.pause = 2000;
    _root.loops = 200;
    _root.dt = 0.0001;
    _root.N = 10;
    _root.a = Array(_root.N + 1)
        .fill()
        .map(() =>
            Array(2)
                .fill()
                .map((_, i) => 1 * (2 * Math.random() - 1))
        );

    console.log(_root.a);
    const ratio = _root.screenSize[0] / _root.screenSize[1];
    const scale = 1.5;
    _root.domain = [
        [-scale * ratio, scale * ratio],
        [-scale, scale],
    ];

    _root.f = (x) => {
        let power = [1, 0];
        let result = [0, 0];
        for (let n = 0; n <= _root.N; n++) {
            result = compAdd(result, compMult(power, _root.a[n]));
            power = compMult(power, x);
        }
        return result;
    };
    // _root.ctx.lineWidth = 10;
};

const init = () => {
    _root.n = 0;
    resetPos(randomCirclePos());
};

const calc = () => {
    _root.px = _root.x;
    _root.x = compAdd(_root.x, compMult([_root.dt, 0], _root.f(_root.x)));
    _root.pmx = _root.mx;
    _root.mx = compAdd(_root.mx, compMult([-_root.dt, 0], _root.f(_root.mx)));
    _root.py = _root.y;
    _root.y = compAdd(_root.y, compMult([0, _root.dt], _root.f(_root.y)));
    _root.pmy = _root.my;
    _root.my = compAdd(_root.my, compMult([0, -_root.dt], _root.f(_root.my)));
    _root.n++;
};

const draw = () => {
    _root.ctx.beginPath();

    const px = virtualToScreen(_root.px);
    const x = virtualToScreen(_root.x);
    _root.ctx.moveTo(...px);
    _root.ctx.lineTo(...x);
    // if (lengthSquared(subVec(px, x)) > 0) {
    // }
    const pmx = virtualToScreen(_root.pmx);
    const mx = virtualToScreen(_root.mx);
    _root.ctx.moveTo(...pmx);
    _root.ctx.lineTo(...mx);

    const py = virtualToScreen(_root.py);
    const y = virtualToScreen(_root.y);
    _root.ctx.moveTo(...py);
    _root.ctx.lineTo(...y);

    const pmy = virtualToScreen(_root.pmy);
    const my = virtualToScreen(_root.my);
    _root.ctx.moveTo(...pmy);
    _root.ctx.lineTo(...my);

    _root.ctx.stroke();
    _root.ctx.closePath();
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
