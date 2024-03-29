const _root = {};

window.onload = () => {
    _root.canvas = document.getElementById("canvas");
    _root.ctx = _root.canvas.getContext("2d");

    document.body.onclick = (e) => {
        const mouseVirtual = screenToVirtualCoords([e.x, e.y]);
        const scale = 20;
        _root.range = [
            [
                mouseVirtual[0] - _root.xrange / 2 / scale,
                mouseVirtual[0] + _root.xrange / 2 / scale,
            ],
            [
                mouseVirtual[1] - _root.yrange / 2 / scale,
                mouseVirtual[1] + _root.yrange / 2 / scale,
            ],
        ];

        console.log(_root.range);

        _root.xrange = _root.range[0][1] - _root.range[0][0];
        _root.yrange = _root.range[1][1] - _root.range[1][0];
        init(false);
    };

    // window.onkeydown = () => {
    //     run();
    // };

    run();
};

window.onresize = () => {
    run();
};

const run = () => {
    _root.canvas.width = window.innerWidth;
    _root.canvas.height = window.innerHeight;
    const xwidth = (2 * _root.canvas.width) / _root.canvas.height;
    _root.range = [
        [-xwidth, xwidth],
        [-2, 2],
    ];

    // helpers
    _root.xrange = _root.range[0][1] - _root.range[0][0];
    _root.yrange = _root.range[1][1] - _root.range[1][0];
    startLoop();
};

const startLoop = () => {
    init();
    clearTimeout(_root.running);
    const loop = () => {
        calc();
        draw();
        _root.t++;
        if (!_root.stopped) _root.running = setTimeout(loop, 1);
    };
    loop();
};

const init = (newColors = true) => {
    _root.hasChangeHappenedYet = false;
    _root.stopped = false;
    _root.possiblyStillIn = [];

    _root.grid = Array(_root.canvas.height)
        .fill()
        .map((_, j) =>
            Array(_root.canvas.width)
                .fill()
                .map((_, i) =>
                    _root.possiblyStillIn.push([
                        [0, 0],
                        screenToVirtualCoords([i, j]),
                        [i, j],
                        new Set(["0,0"]),
                    ])
                )
        );

    _root.ctx.fillRect(0, 0, _root.canvas.width, _root.canvas.height);

    _root.encoder = new GIFEncoder();
    _root.encoder.setRepeat(0);
    _root.encoder.setDelay(1);
    _root.encoder.start();

    if (newColors) _root.colorSeed = newColorSeed(5);
    _root.color = newColor(0);
    _root.t = 0;
};

const screenToVirtualCoords = ([sx, sy]) => {
    return [
        (sx / _root.canvas.width) * _root.xrange + _root.range[0][0],
        (sy / _root.canvas.height) * _root.yrange + _root.range[1][0],
    ];
};

const virtualToScreenCoords = ([vx, vy]) => {
    return [
        ((vx - _root.range[0][0]) / _root.xrange) * _root.canvas.width,
        ((vy - _root.range[1][0]) / _root.yrange) * _root.canvas.height,
    ];
};

const calc = () => {
    _root.justCalculated = [..._root.possiblyStillIn];
    while (_root.possiblyStillIn.length) {
        const pixel = _root.possiblyStillIn.pop();
        pixel[0] = mandelbrotFunc(...pixel);
    }
};

const draw = () => {
    const imageData = _root.ctx.getImageData(
        0,
        0,
        _root.canvas.width,
        _root.canvas.height
    );

    let changed = 0;

    for (const pixel of _root.justCalculated) {
        const [z, c, [sx, sy], seen] = pixel;

        if (dist(z) > 4) {
            changed++;
            const k = 4 * (sx + _root.canvas.width * sy);
            for (let z = 0; z < 3; z++) {
                imageData.data[k + z] = _root.color[z];
            }
            imageData.data[k + 3] = 255;
            delete seen;
            continue;
        }
        const key = z[0] + z[1];
        if (seen.has(key)) {
            delete seen;
            continue;
        }
        seen.add(key);
        _root.possiblyStillIn.push(pixel);
    }

    _root.ctx.putImageData(imageData, 0, 0);

    if (_root.t > 200) {
        _root.encoder.finish();
        _root.encoder.download("yooooo.gif");
        _root.stopped = true;
        return;
    }

    if (changed < 10) {
        if (_root.hasChangeHappenedYet) {
            console.log("NO CHANGE");
            _root.noChangeCount++;
            if (_root.noChangeCount > 2) {
                console.log("DONE");
                _root.encoder.finish();
                _root.encoder.download("yooooo.gif");
                _root.stopped = true;
            }
        }
    } else {
        console.log("CHANGE");
        _root.encoder.addFrame(_root.ctx);
        _root.hasChangeHappenedYet = true;
        _root.noChangeCount = 0;
    }

    // pick new color
    _root.color = newColor(_root.t);
};

const newColorSeed = (n) =>
    Array(n)
        .fill()
        .map(() =>
            Array(3)
                .fill()
                .map(() => Math.floor(Math.random() * 256))
        );

const newColor = (t) => {
    const frequency = 10;
    const adjustedT = t / frequency;
    const color1 =
        _root.colorSeed[Math.floor(adjustedT) % _root.colorSeed.length];
    const color2 =
        _root.colorSeed[(Math.floor(adjustedT) + 1) % _root.colorSeed.length];
    const fracPart = adjustedT - Math.floor(adjustedT);

    return addVec(multVec(1 - fracPart, color1), multVec(fracPart, color2));
};

const mandelbrotFunc = (z, c) => {
    return addVec(multComp(z, z), c);
};

const dist = ([a, b]) => a * a + b * b;

// Math

const multComp = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c];

const addVec = (a, b) => {
    return a.map((x, i) => x + b[i]);
};

const subVec = (a, b) => {
    return a.map((x, i) => x - b[i]);
};

const multVec = (a, V) => {
    return V.map((x, i) => x * a);
};
