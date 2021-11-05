let canvas, ctx;

window.onload = () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init();
    startLoop();
};

window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}

const startLoop = () => {
    setTimeout(startLoop, 1000 / fps);
    update();
}

/**********************
 * DEFAULT CONFIGURATION
 **********************/
const bodies = [];

const G = [0, 0];
const viscosity = 0.05;

let fps = 1000;


/**********************
 * THE REST
 **********************/
const init = () => {
    // bodies.push(newBody([Math.random() * canvas.width, Math.random() * canvas.height], Array(100).fill(1), 10000, 0.1, 0.001, 0));
    for (let i = 0; i < 10; i++) {
        bodies.push(newBody([Math.random() * canvas.width, Math.random() * canvas.height], Array(100).fill(1), Math.random() * 10000, 0.1, 0.001, 1));
    }
};

const update = () => {
    for (const body of bodies) {
        // console.log(body);
        const area = body.vertices.slice(1, body.vertices.length - 1).reduce((p, vertex, i) => {
            const v1 = subVec(vertex.pos, body.vertices[0].pos);
            const v2 = subVec(body.vertices[i + 2].pos, vertex.pos);
            return p + (v1[0] * v2[1] - v1[1] * v2[0]) / 2;
        }, 0);

        // console.log(area);
        const deltaArea = body.targetArea - area;
        // Could maybe be faster without unit vectors
        const outwardVectors = body.vertices.map((vertex, i) => {
            const v1 = unitVec(subVec(vertex.pos, body.vertices[(body.vertices.length + i - 1) % body.vertices.length].pos));
            const v2 = unitVec(subVec(body.vertices[(body.vertices.length + i + 1) % body.vertices.length].pos, vertex.pos));
            const cross = (v1[0] * v2[1] - v1[1] * v2[0]) || 1;
            const diff = subVec(v1, v2);
            const add = addVec(v1, v2);
            return [[0.5 * add[1], -0.5 * add[0]], diff];
            // return unitVec(subVec(v1, v2));
        });
        const oldPos = body.vertices.map(vertex => [...vertex.pos]);
        for (const [i, vertex] of body.vertices.entries()) {
            // Side length springs
            const next = (body.vertices.length + i + 1) % body.vertices.length;
            const nextDiff = subVec(oldPos[i], oldPos[next]);
            const nextLen = lengthVec(nextDiff);
            if (nextLen > 0)
                vertex.v = addVec(vertex.v, multConstVec((body.sideLengths[i] / nextLen - 1) * body.sideK, nextDiff));

            const last = (body.vertices.length + i - 1) % body.vertices.length;
            const lastDiff = subVec(oldPos[i], oldPos[last]);
            const lastLen = lengthVec(lastDiff);
            if (lastLen > 0)
                vertex.v = addVec(vertex.v, multConstVec((body.sideLengths[last] / lastLen - 1) * body.sideK, lastDiff));

            // // Area spring
            vertex.v = addVec(vertex.v, multConstVec(deltaArea * body.areaK, outwardVectors[i][0]));

            // Smoothness spring
            vertex.v = addVec(vertex.v, multConstVec(-body.smoothnessK / 2, outwardVectors[i][1]));

            //gravity
            vertex.v = addVec(vertex.v, G);

            //viscosity
            vertex.v = multConstVec(1 - viscosity, vertex.v);

            //collid with ground
            if (vertex.pos[1] > canvas.height - 50) {
                vertex.pos[1] = canvas.height - 50;
                vertex.v[1] = 0;
            } else if (vertex.pos[1] < 50) {
                vertex.pos[1] = 50;
                vertex.v[1] = 0;
            } else if (vertex.pos[0] < 50) {
                vertex.pos[0] = 50;
                vertex.v[0] = 0;
            } else if (vertex.pos[0] > canvas.width - 50) {
                vertex.pos[0] = canvas.width - 50;
                vertex.v[0] = 0;
            }

            vertex.pos = addVec(vertex.pos, vertex.v);
        }
    }
    draw();
};

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const body of bodies) {
        ctx.beginPath();
        ctx.moveTo(...body.vertices[0].pos);
        for (const vertex of body.vertices.slice(1)) {
            ctx.lineTo(...vertex.pos);
        };
        ctx.lineTo(...body.vertices[0].pos);
        ctx.stroke();
    }
};

const newBody = (startPos, sideLengths, targetArea, sideK, areaK, smoothnessK) => {
    if (sideLengths.length < 3) throw "Bodys must be at least TRIANGLES";
    return { sideLengths, targetArea, sideK, areaK, smoothnessK, vertices: Array(sideLengths.length).fill().map(() => ({ pos: addVec(startPos, [Math.random() * 50, Math.random() * 50]), v: [0, 0] })) };
}

const posInBody = (body, pos) => {
    for (const [i, vertex] of body.vertices.slice(1, body.vertices.length - 1).entries()) {
        const a = body.vertices[0].pos;
        const b = body.vertices[i + 2].pos;
        let crosses = 0;
        if (inRange(a[0], b[0], pos[0]) && a[1] + (pos[0] - a[0]) * (b[1] - a[1]) / (b[0] - a[0]) > pos[1]) crosses++;
        if (inRange(a[0], vertex.pos[0], pos[0]) && a[1] + (pos[0] - a[0]) * (vertex.pos[1] - a[1]) / (vertex.pos[0] - a[0]) > pos[1]) crosses++;
        if (inRange(b[0], vertex.pos[0], pos[0]) && b[1] + (pos[0] - b[0]) * (vertex.pos[1] - b[1]) / (vertex.pos[0] - b[0]) > pos[1]) crosses++;
        if (crosses === 1) {
            return true;
        }
    }
}

const inRange = (a, b, c) => (c >= a && c <= b) || (c >= b && c <= a);
window.oncontextmenu = function () {
    return false;     // cancel default menu
}

window.onmousedown = (e) => {
    let isRightClick
    e = e || window.event;
    if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightClick = e.which == 3;
    else if ("button" in e)  // IE, Opera 
        isRightClick = e.button == 2;
    for (const body of bodies) {
        if (posInBody(body, [e.x, e.y])) {
            console.log(body);
            // for (const vertex of body.vertices) {
            //     vertex.v[1] -= 50;
            // }
        }
    }
    // G[1] += 0.1;
}

window.onkeydown = () => {
    if (G[0] === 0) {
        G[0] = (2 * Math.random() - 1) * 0.1;
        G[1] = (2 * Math.random() - 1) * 0.1;
    } else {
        G[0] = 0;
        G[1] = 0;
        for (const body of bodies) {
            const newV = [0, 0];
            newV[0] = 20 * (2 * Math.random() - 1);
            newV[1] = 20 * (2 * Math.random() - 1);
            for (const vertex of body.vertices) {
                vertex.v = newV;
            }
        }
    }
}

const addVec = (a, b) => {
    if (a.length !== b.length) throw "Mismatched vectors!";
    return a.map((ax, i) => ax + b[i]);
}

const multConstVec = (a, v) => {
    return v.map(x => x * a);
}

const vecDist = (a, b) => {
    return Math.sqrt(a.reduce((p, ax, i) => p + (ax - b[i]) ** 2, 0));
}

const subVec = (a, b) => {
    if (a.length !== b.length) throw "Mismatched vectors!";
    return a.map((ax, i) => ax - b[i]);
}

const lengthVec = (a) => {
    return Math.sqrt(a.reduce((p, x) => p + x ** 2, 0));
}

const unitVec = (a) => {
    const length = lengthVec(a);
    if (length > 0)
        return a.map(x => x / length);
    return a.map(() => 0);
}