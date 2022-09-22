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
        if (!_root.stopped) _root.running = setTimeout(loop, 2000);
    };
    loop();
};

const constants = () => {
    _root.N = 2;
};

const init = () => {
    _root.canvas.width = 500;
    _root.canvas.height = 500;

    _root.cube = [];
    for (let d = 0; d < 3; d++) {
        for (let vx = 0; vx < _root.N; vx++) {
            for (let vy = 0; vy < _root.N; vy++) {
                const pos = [
                    (vx * 2 - _root.N + 1) / _root.N,
                    (vy * 2 - _root.N + 1) / _root.N,
                ];
                newVec(pos, d, 0);
                newVec(pos, d, 1);
            }
        }
    }

    _root.camera = {
        pos: [5, 5, 5],
        dir: makeUnitVec([-1, -1, -1]),
        pov: 5,
    };

    _root.camera.x = makeUnitVec(cross(_root.camera.dir, [0, 0, 1]));
    _root.camera.y = cross(_root.camera.x, _root.camera.dir);
    _root.camera.x = multVec(_root.camera.pov, _root.camera.x);
    _root.camera.y = multVec(_root.camera.pov, _root.camera.y);
};

const calc = () => {
    for (let k = 0; k < 1; k++) {
        const ru = [0, 0, 0];
        ru[Math.floor(Math.random() * 3)] =
            Math.floor(Math.random() * 2) * 2 - 1;
        turn(
            ru,
            Math.ceil(Math.random() * 3),
            // Math.floor(Math.random() * 2) * 2 - 1,
            // Math.random() * 4, lol
            Math.floor(Math.random() * Math.floor(_root.N / 2)) + 1
        );
    }
};

const draw = () => {
    _root.ctx.clearRect(0, 0, _root.canvas.width, _root.canvas.height);
    for (const square of _root.cube) {
        if (dot(square.u, _root.camera.dir) < 0) continue;
        _root.ctx.fillStyle = getColor(square.color);
        _root.ctx.beginPath();
        for (const [i, cornerPos] of getSquareCorners(square).entries()) {
            const pos = cameraToScreenCoords(
                threeDToCameraCoords(subVec(_root.camera.pos, cornerPos))
            );
            if (i === 0) _root.ctx.moveTo(...pos);
            else _root.ctx.lineTo(...pos);
        }
        _root.ctx.fill();
    }
};

/**
 * Camera
 */

const getColor = (colorId) => {
    switch (colorId) {
        case 0:
            return "#ff0000";
        case 1:
            return "#ff9900";
        case 2:
            return "#dddddd";
        case 3:
            return "#ffff00";
        case 4:
            return "#4444ff";
        case 5:
            return "#44aa44";
    }
};

const getSquareCorners = (square) => {
    const u = [0, 0, 0];
    const v = [0, 0, 0];
    for (let i = 0; i < square.u.length; i++) {
        if (Math.abs(square.u[i]) < 0.5) continue;
        u[(i + 1) % 3] = 1 / _root.N;
        v[(i + 2) % 3] = 1 / _root.N;
        break;
    }
    return [
        addVec(square.pos, multVec(1, u), multVec(1, v)),
        addVec(square.pos, multVec(1, u), multVec(-1, v)),
        addVec(square.pos, multVec(-1, u), multVec(-1, v)),
        addVec(square.pos, multVec(-1, u), multVec(1, v)),
    ];
};

const threeDToCameraCoords = (pos) => {
    return [
        dot(_root.camera.x, pos) / dot(_root.camera.x, _root.camera.x),
        dot(_root.camera.y, pos) / dot(_root.camera.y, _root.camera.y),
        // dot(_root.camera.dir, pos),
    ];
};

const cameraToScreenCoords = ([x, y]) => {
    return [
        ((x + 1) / 2) * _root.canvas.width,
        (1 - (y + 1) / 2) * _root.canvas.height,
    ];
};

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

/**
 * UHH
 */

const turn = (u, theta, n = 1) => {
    if (theta === 0) return;
    while (theta > 1) {
        turn(u, 1, n);
        theta--;
    }
    const rotationMatrix = makeRotationMatrix(u, (theta * Math.PI) / 2);
    for (const point of _root.cube) {
        if (dot(point.pos, u) > 1 - (2 * n) / _root.N) {
            point.pos = matMult(rotationMatrix, point.pos);
            point.u = matMult(rotationMatrix, point.u);
        }
    }
};

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
