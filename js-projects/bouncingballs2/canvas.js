let canvas;

const fps = 1000;

$(document).ready(function() {

    canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.phoneScreen = canvas.height > canvas.width;
    document.getElementById("chat").style.width = window.phoneScreen ? "100%" : "20%";
    document.getElementById("chat").style.height = canvas.height + "px";
    document.body.style.fontSize = window.phoneScreen ? "24px" : "12px";

    window.onresize = function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        window.phoneScreen = canvas.height > canvas.width;
        document.body.style.fontSize = window.phoneScreen ? "24px" : "12px";
        document.getElementById("chat").style.height = canvas.height + "px";
        document.getElementById("chat").style.width = window.phoneScreen ? "100%" : "20%";
        if (window.chatOpen) {
            document.getElementById('openChat').style.right = window.phoneScreen ? "20%" : "100%";
            document.getElementById('openChat').style.opacity = window.phoneScreen ? "0" : "1";
            document.getElementById('closeChat').style.opacity = window.phoneScreen ? "1" : "0";
        }

    }

    Array.from(document.getElementsByTagName("input")).forEach(element => {
        let value = (element.value - element.min) / (element.max - element.min) * 100
        element.style.background = 'linear-gradient(to right, #82CFD0 0%, #82CFD0 ' + value + '%, #fff ' + value + '%, white 100%)'
        addEventListener(element, "oninput", function() {
            value = (this.value - this.min) / (this.max - this.min) * 100
            this.style.background = 'linear-gradient(to right, #82CFD0 0%, #82CFD0 ' + value + '%, #fff ' + value + '%, white 100%)'
        })
    });

    init();
    move(ctx);
    handleInput();
});

const newBall = (x, y) => {
    const v = mult(100, [Math.random() * 2 - 1, Math.random() * 2 - 1]);
    const pos = [x, y];
    balls.push({
        x: pos,
        v,
        path: [
            pos,
            add(pos, mult(dt, v))
        ]
    });
}

const matrix = [
    [Math.random() * 10 - 5, Math.random() * 10 - 5],
    [Math.random() * 10 - 5, Math.random() * 10 - 5]
];

const accel = (x) => {
    const translated = sub(x, [canvas.width / 2, canvas.height / 2]);
    console.log(transpose(translated))
    return transpose(mult(matrix, transpose(translated)))[0];
}

const dt = 0.01;
const keep = 1;

let balls = [];

const init = () => {
    balls = [];
}

const pause = false;

const move = (ctx) => {
    balls.forEach((ball, i) => {
        ball.x = add(add(mult(2, ball.path[0]), mult(-1, ball.path[1])), mult(dt ** 2, accel(ball.path[0])));
        ball.path = [ball.x, ...ball.path.slice(0, keep)];

        if (ball.x < 0 || ball.x > canvas.width || ball.y < 0 || ball.y > canvas.height)
            ball.remove = true;
    });

    balls = balls.filter(ball => !ball.remove);

    if (!pause)
        draw(ctx);
}

const draw = (ctx) => {
    // background

    balls.forEach(ball => {
        ctx.beginPath();
        ctx.moveTo(...ball.path[1]);
        ctx.lineTo(...ball.path[0]);
        ctx.strokeStyle = "#ff0000";
        ctx.stroke();
    });

    // redraw
    setTimeout(() => { move(ctx); }, 1000 / fps);
}

const calcEnergy = () => balls.reduce((p, c) => p + 0.5 * c.mass * lengthSquared(c.v) - c.mass * dot(sub(c.pos, [0, canvas.height]), gravity), 0);

const handleInput = () => {
    canvas.onmousedown = function(e) {
        newBall(e.x, e.y);
    }
}


const addEventListener = (target, listenerType, func) => {
    if (!target[listenerType]) target[listenerType] = func;
    else target[listenerType] = function(e) {
        target[listenerType](e);
        func(e);
    }
}






/*


MATH STUFF

*/

const quadratic = (a, b, c) => {
    let disc = b ** 2 - 4 * a * c;
    if (disc < 0) return undefined;
    disc = Math.sqrt(disc);
    return [(-b - disc) / 2 / a, (-b + disc) / 2 / a];
}


const distSquared = ({ pos: pos1 }, { pos: pos2 }) => {
    const a = sub(pos2, pos1);
    return dot(a, a);
}

const rref = (A) => {
    if (size(A).length !== 2) throw "rref is not supported for non-matrices";
    const newA = deepCopy(A);
    for (let rowNum = 0; rowNum < A.length; rowNum++) {
        const topRow = newA[rowNum];
        const col = firstNonZeroIndex(topRow);
        if (col === -1) continue;

        newA[rowNum] = mult(topRow, 1 / topRow[col]);
        newA.forEach((row, i) => {
            if (i === rowNum) return;
            if (row[col] === 0) return;
            newA[i] = sub(row, mult(newA[rowNum], row[col]));
        });
    }

    return newA;
}
const firstNonZeroIndex = (list, i = 0) => {
    if (list.length === 0) return -1;
    if (list[i] === 0) return firstNonZeroIndex(list, i + 1);
    return i;
}

const project = (from, to) => mult(dot(from, to) / dot(to, to), to);

const unit = (vec) => mult(1 / length(vec), vec);

const lengthSquared = (vector) => dot(vector, vector);

const length = (vector) => Math.sqrt(lengthSquared(vector));

const rotationMatrix = (theta) => {
    return [
        [Math.cos(theta), -Math.sin(theta)],
        [Math.sin(theta), Math.cos(theta)]
    ]
}

const size = (A) => {
    if (!A.length) return [];
    const first = size(A[0]);
    if (A.slice(1).every(x => deepEquals(size(x), first))) return [A.length, ...first];
    throw "INCONSISTENT DIMENSIONS";
}

const deepCopy = (A) => {
    if (typeof A !== 'object') return A;
    if (A.length !== undefined) return A.map(deepCopy);
    return Object.keys(A).reduce((p, key) => ({...p, [key]: deepCopy(A[key]) }), {});
}

const deepEquals = (A, B) => {
    if (typeof A !== typeof B) return false;
    if (typeof A !== 'object') return A === B;
    if (A.length !== B.length) return false;
    if (A.length) return A.every((a, i) => deepEquals(a, B[i]));

    const AKeys = Object.keys(A);
    const BKeys = Object.keys(B);
    if (AKeys.length !== BKeys.length) return false;
    return AKeys.every(key => deepEquals(A[key], B[key]));
}

const dot = (A, B) => {
    if (A.length !== B.length) throw "INVALID DIMENSIONS";
    if (A.length === 1) return mult(A[0], B[0]);
    return A.reduce((p, c, i) => p ? add(p, mult(c, B[i])) : mult(c, B[i]), undefined);
};

const add = (A, B, validated = false) => {
    const validate = validated || deepEquals(size(A), size(B));
    if (!validate) throw "INVALID DIMENSIONS";
    if (A.length === undefined) return A + B;
    if (A.length === 0) return [];
    return [add(A[0], B[0], validate), ...add(A.slice(1), B.slice(1), validate)];
}

const neg = (A) => mult(-1, A);

const mult = (A, B) => {
    const ASize = size(A);
    const BSize = size(B);

    if (ASize.length === 0) {
        if (BSize.length === 0) return A * B;
        return B.map(b => mult(A, b));
    }
    if (BSize.length === 0) return mult(B, A);
    if (ASize.length < 2) throw "INVALID DIMENSIONS";
    if (ASize[1] !== BSize[0]) throw "INVALID DIMENSIONS";
    return A.map(row => transpose(B).map(col => dot(row, col)));
}

const transpose = (A) => {
    const ASize = size(A);
    if (ASize.length === 1) return transpose([A]);
    if (ASize.length % 2 !== 0) throw "INVALID DIMENSIONS";
    if (ASize.length === 0) return A;
    return A[0].map((_, i) => A.map(row => transpose(row[i])));
}

const sub = (A, B) => add(A, neg(B));

const element = (A) => {
    const ASize = size(A);
    if (ASize.length === 0) return A;
    if (ASize.every(dim => dim === 1)) return element(A[0]);
    throw "INVALID DIMENSIONS";
}

const concat = (A, B) => transpose([...transpose(A), ...transpose(B)]);

const identity = (s) => Array(s).fill().map((_, i) => Array(s).fill().map((_, j) => i == j ? 1 : 0));

const print = (A) => {
    console.log(A.map(row => row.map(num => (Math.round(num * 100) / 100)).join('\t')).join('\n'), '\n');
}

// TODO: MAKE BETTER
const inverse = (A) => transpose(transpose(rref(concat(A, identity(A.length)))).slice(A.length));

// const matrix = [
//     [1, 1, 1, 0, 9, 9, 12, 1],
//     [3, 4, 0, 1, 6, 9, 12, 2],
//     [1, 2, -1, 4, 9, 8, 12, 0],
//     [3, 3, 2, 1, 7, 9, -12, 2],
//     [1, 1, 4, 0, 9, 9, 0, 1],
//     [3, 4, 0, 1, 9, 5, 12, 0]
// ];
// print(rref(matrix));

// console.log(inverse([
//     [3, 0],
//     [5, -1]
// ]));