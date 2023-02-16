const parameters = {
    alpha: 5,
    mode: "circle",
    equation: ([x, y]) => x ** 2 + y ** 2 - 1, // with just this I can get the D function,
    P: (z0, z) => Math.acos(dot(z0, z)), // should be accurate as long as both are actually on the circle
    epsilon: 0.02,
}

const PCache = {};
const P = (z0, z) => {
    const key = [z0 + '', z + ''].sort().join(':');
    if (PCache[key]) return PCache[key];
    PCache[key] = parameters.P(z0, z);
    return PCache[key];
}


const settings = {
    pixelSize: 2,
    zoom: 2,
    backgroundColor: [1, 1, 1],
    foregroundColor: [0, 0, 0],
    safeColor: [0, 1, 0],
    unsafeColor: [1, 0, 0],
    catSize: 0.05,
}

const canvas = {
    changes: [],
}

const mouse = {
    screenPos: [0, 0],
    vPos: [0, 0],
}

const globals = {
    borderPixels: [],
    insidePixels: [],
    cat: [0, 0],
}

window.onload = () => {
    canvas.canvasObject = document.getElementById('canvas');
    canvas.ctx = canvas.canvasObject.getContext('2d');

    handleInput();
    start();
};

const start = () => {
    canvas.canvasObject.width = window.innerWidth;
    canvas.canvasObject.height = window.innerHeight;
    settings.screenSize = Math.min(canvas.canvasObject.width, canvas.canvasObject.height) / 2;

    canvas.fillStyle = "black";
    canvas.ctx.fillRect(0, 0, canvas.canvasObject.width, canvas.canvasObject.height);

    settings.imageData = canvas.ctx.getImageData(0, 0, canvas.canvasObject.width, canvas.canvasObject.height);

    drawBG();
}

const drawBG = () => {

    for (let gy = 0; gy < canvas.canvasObject.height / settings.pixelSize; gy++) {
        for (let gx = 0; gx < canvas.canvasObject.width / settings.pixelSize; gx++) {

            const screenPos = [gx * settings.pixelSize, gy * settings.pixelSize];

            const vPos = screenToVirtualPos(screenPos);

            const value = parameters.equation(vPos);
            let color;

            if (Math.abs(value) < parameters.epsilon) {
                color = settings.foregroundColor;
                globals.borderPixels.push(vPos);
            } else {
                if (value > 0) color = settings.backgroundColor;
                else {
                    color = settings.foregroundColor;
                    globals.insidePixels.push(screenPos);
                }
            }

            drawPixel(screenPos, color);
        }
    }

    canvas.ctx.putImageData(settings.imageData, 0, 0);

    settings.originalImage = settings.imageData;
}

const drawSafe = () => {
    canvas.ctx.putImageData(settings.originalImage, 0, 0);
    settings.imageData = canvas.ctx.getImageData(0, 0, canvas.canvasObject.width, canvas.canvasObject.height);


    // console.log("DRAWING SAFE");
    inside: for (const insidePixel of globals.insidePixels) {
        const vPos = screenToVirtualPos(insidePixel);
        for (const borderPixel of globals.borderPixels) {
            if ((parameters.alpha ** 2) * lengthSquared(subVec(borderPixel, vPos)) < P(borderPixel, globals.cat) ** 2) {
                drawPixel(insidePixel, settings.safeColor);
                continue inside;
            }
        }
        drawPixel(insidePixel, settings.unsafeColor);
    }

    canvas.ctx.putImageData(settings.imageData, 0, 0);
}

const getCat = () => {
    let closestToCat = globals.borderPixels[0];
    let dist = lengthSquared(subVec(closestToCat, mouse.vPos));
    for (const borderPixel of globals.borderPixels) {
        P(borderPixel, closestToCat);
        const newDist = lengthSquared(subVec(borderPixel, mouse.vPos));
        if (newDist < dist) {
            dist = newDist;
            closestToCat = borderPixel;
        }
    }
    globals.cat = closestToCat;

}

const drawCat = () => {

    canvas.ctx.putImageData(settings.imageData, 0, 0);


    const catPos = virtualToScreenPos(globals.cat);

    canvas.ctx.fillStyle = settings.foregroundColor;
    canvas.ctx.beginPath();
    canvas.ctx.arc(catPos[0], catPos[1], settings.screenSize * settings.catSize, 0, 2 * Math.PI);
    canvas.ctx.fill();
}

const drawPixel = (screenPos, color) => {
    const alpha = (settings.pixelSize >= 1 ? 1 : (settings.pixelSize ** 2)) * (color[3] || 1);

    for (let py = 0; py < settings.pixelSize; py++) {
        for (let px = 0; px < settings.pixelSize; px++) {
            const j = 4 * ((Math.floor(screenPos[0]) + px) + canvas.canvasObject.width * (Math.floor(screenPos[1]) + py));
            for (let k = 0; k < 3; k++) {
                settings.imageData.data[j + k] += color[k] * alpha * 255;
            }
        }
    }
}

const handleInput = () => {
    document.onmousemove = e => {
        mouse.screenPos[0] = e.x;
        mouse.screenPos[1] = e.y;
        mouse.vPos = screenToVirtualPos(mouse.screenPos);
        getCat();
        drawSafe();
        drawCat();
    };
}

const screenToVirtualPos = ([x, y]) => [(x - canvas.canvasObject.width / 2) / settings.screenSize * settings.zoom, (canvas.canvasObject.height / 2 - y) / settings.screenSize * settings.zoom];

const virtualToScreenPos = ([x, y]) => [x / settings.zoom * settings.screenSize + canvas.canvasObject.width / 2, canvas.canvasObject.height / 2 - y / settings.zoom * settings.screenSize];

const subVec = (a, b) => a.length ? [a[0] - b[0], ...subVec(a.slice(1), b.slice(1))] : [];

const addVec = (a, b) => a.length ? [a[0] + b[0], ...addVec(a.slice(1), b.slice(1))] : [];

const dot = (a, b) => a.length ? a[0] * b[0] + dot(a.slice(1), b.slice(1)) : 0;

const unit = (v) => {
    const length = getLength(v);
    return v.map(x => x / length);
}

const getLength = (v) => Math.sqrt(lengthSquared(v));

const lengthSquared = (v) => dot(v, v);

const constMult = (a, v) => v.map(x => x * a);