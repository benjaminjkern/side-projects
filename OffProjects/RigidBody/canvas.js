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

let fps = 60;


/**********************
 * THE REST
 **********************/
const G = [0, 1];
const nodes = [];
const selectRadius = 10;
const epsilon = 1e-15;
const maxCount = 1000;


let running = false;
let drawing = false;
let preSelectedNode;
let selectedNode;
let moving;
let mouse = [0, 0];
let lastUp, lastDown;

const init = () => {
    //     const XMAX = 201;
    //     const YMAX = 25;
    //     const margin = 400;
    //     for (let x = 0; x < XMAX; x++) {
    //         for (let y = 0; y < YMAX; y++) {
    //             const newNode = { id: nodes.length, pos: [margin + x * (canvas.width - 2 * margin) / (XMAX - 1), margin + y * (canvas.height - 2 * margin) / (YMAX - 1)], connections: [] };
    //             if (y === 0 && (x === 0 || x === XMAX - 1 || x % 4 === 0)) newNode.locked = true;
    //             if (y !== 0) newNode.connections.push(newNode.id - 1);
    //             if (y !== YMAX - 1) newNode.connections.push(newNode.id + 1);
    //             if (x !== 0) newNode.connections.push(newNode.id - YMAX);
    //             if (x !== XMAX - 1) newNode.connections.push(newNode.id + YMAX);
    //             nodes.push(newNode);
    //         }
    //     }
};

const update = () => {
    if (running) {
        const savedNodes = safeNodes();
        for (const node of savedNodes) {
            node.oPos = node.pos;
            if (!node.locked) {
                node.v = addVec(node.v, G);
                node.pos = addVec(node.pos, node.v);
            }
        }

        let count = 0;
        let goAgain = true;
        while (goAgain && count < maxCount) {
            goAgain = false;
            for (const node of savedNodes) {
                if (node.locked || !node.connections.length) {
                    node.newPos = node.pos;
                    continue;
                }
                const possibleNewSpots = node.connections.map((connection, i) => setVecToDist(nodes[connection].pos, node.pos, node.distances[i]));

                node.newPos = multConstVec(1 / node.connections.length, possibleNewSpots.reduce((p, c) => addVec(p, c), [0, 0]));
            }
            for (const node of savedNodes) {
                if (vecDist(node.newPos, node.pos) > epsilon) goAgain = true;
                node.pos = node.newPos;
            }
            count++;
        }
        // if (count >= maxCount) console.log("Counted over!");
        for (const node of savedNodes) {
            node.v = subVec(node.pos, node.oPos);
        }
        // for (const node of savedNodes) {
        //     node.v = multConstVec(0.5, addVec(node.v, subVec(node.pos, node.oPos)));
        // }
    }

    draw();
};

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (moving) {
        ctx.fillStyle = '#ff000044';
        ctx.fillRect(canvas.width - 50, canvas.height - 50, canvas.width, canvas.height);
    }
    if (preSelectedNode) {
        ctx.fillStyle = '#ff000044';
        ctx.beginPath();
        ctx.arc(preSelectedNode.pos[0], preSelectedNode.pos[1], selectRadius, 0, 2 * Math.PI);
        ctx.fill();
    }
    if (selectedNode) {
        ctx.fillStyle = '#ff000088';
        ctx.beginPath();
        ctx.arc(selectedNode.pos[0], selectedNode.pos[1], selectRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(selectedNode.pos[0], selectedNode.pos[1]);
        ctx.lineTo(mouse[0], mouse[1]);
        ctx.stroke();
    }
    for (const node of safeNodes()) {
        ctx.strokeStyle = node.locked ? 'red' : 'black';
        ctx.beginPath();
        ctx.arc(node.pos[0], node.pos[1], 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.strokeStyle = 'black';
        for (const connection of node.connections) {
            if (connection < node.id) {
                ctx.beginPath();
                ctx.moveTo(node.pos[0], node.pos[1]);
                ctx.lineTo(nodes[connection].pos[0], nodes[connection].pos[1]);
                ctx.stroke();
            }
        }
    }
};

window.oncontextmenu = function() {
    return false; // cancel default menu
}

const safeNodes = () => nodes.filter(node => node);

window.onmousedown = (e) => {
    const rightNow = new Date().getTime();
    if (preSelectedNode) {
        const dragging = preSelectedNode;
        setTimeout(() => {
            if (lastUp < rightNow) {
                moving = dragging;
                preSelectedNode = undefined;
                selectedNode = undefined;
            }
        }, 300);
    }
    lastDown = rightNow;
}

window.onmouseup = (e) => {
    // figure out if right click
    let isRightMB;
    e = e || window.event;
    if ("which" in e) // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3;
    else if ("button" in e) // IE, Opera 
        isRightMB = e.button == 2;

    lastUp = new Date().getTime();

    if (moving) {
        if (moving.pos[0] > canvas.width - 50 && moving.pos[1] > canvas.height - 50) {
            for (const node of safeNodes()) {
                node.connections = node.connections.filter(connection => connection !== moving.id);
            }
            nodes[moving.id] = undefined;
        }
        moving = undefined;
        return;
    }

    if (selectedNode && preSelectedNode) {
        if (selectedNode != preSelectedNode) {
            if (!selectedNode.connections.includes(preSelectedNode.id)) {
                selectedNode.connections.push(preSelectedNode.id);
                preSelectedNode.connections.push(selectedNode.id);
            } else {
                selectedNode.connections = selectedNode.connections.filter(connection => connection !== preSelectedNode.id);
                preSelectedNode.connections = preSelectedNode.connections.filter(connection => connection !== selectedNode.id);
            }
        } else {
            selectedNode.locked = !selectedNode.locked;
        }
        selectedNode = undefined;
    } else if (selectedNode && !preSelectedNode) {
        const newId = getNewId();
        selectedNode.connections.push(newId);
        nodes[newId] = { id: newId, pos: [e.x, e.y], v: [0, 0], connections: [selectedNode.id] };
        if (!isRightMB) selectedNode = undefined;
        else selectedNode = nodes[newId];
        preSelectedNode = nodes[newId];
    } else if (preSelectedNode) {
        selectedNode = preSelectedNode;
    } else {
        const newId = getNewId();
        nodes[newId] = { id: newId, pos: [e.x, e.y], v: [0, 0], connections: [] };
        preSelectedNode = nodes[newId];
    }
}

const getNewId = () => {
    for (const [i, node] of nodes.entries()) {
        if (node === undefined) return i;
    }
    return nodes.length;
}

window.onmousemove = (e) => {
    mouse = [e.x, e.y];
    if (moving) {
        moving.pos = mouse;
        return;
    }
    for (const node of safeNodes()) {
        if (!node.locked && running) continue;
        if (vecDist(mouse, node.pos) < selectRadius) {
            preSelectedNode = node;
            return;
        }
    }
    preSelectedNode = undefined;
}

window.onkeydown = (e) => {
    if (e.key === ' ') {
        running = !running;
        if (running) {
            for (const node of safeNodes()) {
                node.v = [0, 0];
                node.distances = node.connections.map(connection => vecDist(node.pos, nodes[connection].pos));
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

const setVecToDist = (a, b, d) => {
    const s = d / vecDist(a, b);
    return addVec(multConstVec(1 - s, a), multConstVec(s, b));
}

const setVecBothWaysToDist = (a, b, d) => {
    const s = vecDist(a, b);
    const sMinus = (1 - d / s) / 2;
    const sPlus = (1 + d / s) / 2;
    return [addVec(multConstVec(sPlus, a), multConstVec(sMinus, b)), addVec(multConstVec(sMinus, a), multConstVec(sPlus, b))];
}

const subVec = (a, b) => {
    if (a.length !== b.length) throw "Mismatched vectors!";
    return a.map((ax, i) => ax - b[i]);
}