const _root = {};

window.onload = () => {
    _root.canvas = document.getElementById("canvas");
    _root.ctx = _root.canvas.getContext("2d");

    _root.canvas.width = window.innerWidth;
    _root.canvas.height = window.innerHeight;

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

const constants = () => {};

const init = () => {
    _root.shapes = [
        newPoint([1, 1, 0]),
        newPoint([1, -1, 0]),
        newPoint([-1, 1, 0]),
        newPoint([-1, -1, 0]),
    ];

    _root.camera = {
        pos: [5, 5, 5],
        dir: makeUnitVec([-1, -1, -1]),
        pov: 2,
    };

    redoCamera();

    _root.ctx.lineWidth = 2;
    _root.ctx.lineJoin = "round";
    _root.ctx.lineCap = "round";
};

const redoCamera = () => {
    _root.camera.x = makeUnitVec(cross(_root.camera.dir, [0, 0, 1]));
    _root.camera.y = cross(_root.camera.x, _root.camera.dir);
    _root.camera.x = multVec(_root.camera.pov, _root.camera.x);
    _root.camera.y = multVec(_root.camera.pov, _root.camera.y);
};

const calc = () => {
    _root.camera.pos = matMult(
        makeRotationMatrix([0, 0, 1], 0.01),
        _root.camera.pos
    );
    _root.camera.dir = matMult(
        makeRotationMatrix([0, 0, 1], 0.01),
        _root.camera.dir
    );
    redoCamera();
};

const draw = () => {
    _root.ctx.clearRect(0, 0, _root.canvas.width, _root.canvas.height);
    // _root.allShapes.forEach(
    //     (square) =>
    //         (square.cameraCoords = threeDToCameraCoords(
    //             subVec(_root.camera.pos, square.pos)
    //         ))
    // )
    // _root.cube.sort((a, b) => b.cameraCoords[2] - a.cameraCoords[2]);

    for (const shape of _root.shapes) {
        shape.draw();
    }
};

/**
 * Camera
 */

const threeDToCameraCoords = (pos) => {
    return [
        dot(_root.camera.x, pos) / dot(_root.camera.x, _root.camera.x),
        dot(_root.camera.y, pos) / dot(_root.camera.y, _root.camera.y),
        dot(_root.camera.dir, pos),
    ];
};

const cameraToScreenCoords = ([x, y]) => {
    return [
        ((x + 1) / 2) * _root.canvas.width,
        (1 - (y + 1) / 2) * _root.canvas.height,
    ];
};

const threeDToScreenCoords = (pos) =>
    cameraToScreenCoords(threeDToCameraCoords(subVec(_root.camera.pos, pos)));

/****
 * MATH
 */

const dot = (a, b) => a.reduce((p, x, i) => p + x * b[i], 0);

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

/****
 * SHAPES
 */
const newPoint = (pos) => {
    const point = { pos };
    point.draw = drawPoint(point);
    return point;
};

const drawPoint = (point) => () => {
    _root.ctx.fillStyle = "black";
    _root.ctx.beginPath();

    const pos = threeDToScreenCoords(point.pos);

    _root.ctx.arc(...pos, 5, 0, 2 * Math.PI);
    _root.ctx.fill();
};
