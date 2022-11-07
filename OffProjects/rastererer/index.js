const _root = {};

window.onload = () => {
    _root.canvas = document.getElementById("canvas");
    _root.ctx = _root.canvas.getContext("2d");

    _root.canvas.width = window.innerHeight;
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
    _root.shapes = [];
    const cube = newParallelopiped([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    cube.color = "red";
    _root.shapes.push(cube);

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

const newLine = (startPos, endPos) => {
    const line = { startPoint: newPoint(startPos), endPoint: newPoint(endPos) };
    line.draw = drawLine(line);
    return line;
};

const drawLine = (line) => () => {
    _root.ctx.fillStyle = line.color || "black";
    _root.ctx.beginPath();

    const startPos = threeDToScreenCoords(line.startPoint.pos);
    const endPos = threeDToScreenCoords(line.endPoint.pos);

    _root.ctx.moveTo(...startPos);
    _root.ctx.lineTo(...endPos);
    _root.ctx.stroke();

    // line.startPoint.draw();
    // line.endPoint.draw();
};

// abstract
const newFace = (...points) => {
    if (points.length !== 3) throw "NOPE";
    const face = { points };
    face.draw = drawFace(face);
    return face;
};

const drawFace = (face) => () => {
    if (
        dot(
            _root.camera.dir,
            cross(
                subVec(face.points[1], face.points[0]),
                subVec(face.points[2], face.points[1])
            )
        ) >= 0
    )
        return;

    _root.ctx.fillStyle = face.color || "black";
    _root.ctx.beginPath();
    _root.ctx.moveTo(...threeDToScreenCoords(face.points[0]));
    _root.ctx.lineTo(...threeDToScreenCoords(face.points[1]));
    _root.ctx.lineTo(...threeDToScreenCoords(face.points[2]));

    _root.ctx.fill();
};

const newPolygon = (...points) => {
    const polygon = { lines: [], faces: [] };
    for (const [i, point] of points.entries()) {
        polygon.lines.push(newLine(point, points[(i + 1) % points.length]));
        if (i > 0 && i < points.length - 1)
            polygon.faces.push(newFace(points[0], point, points[i + 1]));
    }
    polygon.draw = drawPolygon(polygon);
    return polygon;
};

const drawPolygon = (polygon) => () => {
    _root.ctx.fillStyle = polygon.color || "black";

    polygon.faces.forEach((face) => {
        face.draw();
    });
    // polygon.lines.forEach((line) => {
    //     line.draw();
    // });
};

const newShape = (...polygons) => {
    const shape = { polygons };
    shape.draw = drawShape(shape);
    return shape;
};

const drawShape = (shape) => () => {
    shape.polygons.forEach((polygon) => {
        polygon.color = shape.color;
        polygon.draw();
    });
};

const newParallelogram = (centerPos, ux, uy) => {
    const p00 = addVec(centerPos, ux, uy);
    const p01 = addVec(centerPos, ux, multVec(-1, uy));
    const p10 = addVec(centerPos, multVec(-1, ux), uy);
    const p11 = addVec(centerPos, multVec(-1, ux), multVec(-1, uy));

    return newPolygon(p00, p01, p11, p10);
};

const newParallelopiped = (centerPos, ux, uy, uz) => {
    const p000 = addVec(centerPos, ux, uy, uz);
    const p001 = addVec(centerPos, ux, uy, multVec(-1, uz));
    const p010 = addVec(centerPos, ux, multVec(-1, uy), uz);
    const p011 = addVec(centerPos, ux, multVec(-1, uy), multVec(-1, uz));
    const p100 = addVec(centerPos, multVec(-1, ux), uy, uz);
    const p101 = addVec(centerPos, multVec(-1, ux), uy, multVec(-1, uz));
    const p110 = addVec(centerPos, multVec(-1, ux), multVec(-1, uy), uz);
    const p111 = addVec(
        centerPos,
        multVec(-1, ux),
        multVec(-1, uy),
        multVec(-1, uz)
    );

    return newShape(
        newPolygon(p000, p001, p011, p010),
        newPolygon(p000, p010, p110, p100),
        newPolygon(p000, p100, p101, p001),
        newPolygon(p111, p101, p100, p110),
        newPolygon(p111, p011, p001, p101),
        newPolygon(p111, p110, p010, p011)
    );
};
