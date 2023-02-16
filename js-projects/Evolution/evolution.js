let canvas, ctx;

window.onload = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.style.position = "absolute";

    init();
    start();
}

const start = () => {
    if (!paused) {
        setTimeout(() => {
            move();
            draw();
            start();
        }, 1);
    }
}

window.onkeydown = (e) => {
    if (e.key === ' ') {
        paused = !paused;
        if (!paused) start();
    }
}

let paused = false;
let pos = 0;
const CREATURES = {};
const ALLFOOD = {};

const drainInterval = 1000;
let t = 0;

const init = () => {
    for (let i = 0; i < 100; i++) {
        const name = Math.random();
        CREATURES[name] = new Creature(name,
            [Math.random() * canvas.width, Math.random() * canvas.height], 2, 1);
    }
}

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const key in ALLFOOD) {
        const food = ALLFOOD[key];
        ctx.fillStyle = "#00ff0099";
        ctx.beginPath();
        ctx.arc(...food.pos, food.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
    for (const key in CREATURES) {
        const creature = CREATURES[key];
        creature.draw(ctx);
    }
}

const move = () => {
    t = (t + 1) % drainInterval;
    // ALLFOOD[Math.random()] = { radius: 3, pos: [Math.random() * canvas.width, Math.random() * canvas.height] };

    for (const key in CREATURES) {
        const creature = CREATURES[key];
        creature.move();
        creature.drainEnergy();
    }
    if (Object.keys(CREATURES).length === 0) init();
    // pos++;
    // canvas.style.left = (canvas.style.left ? (canvas.style.left.slice(0, canvas.style.left.length - 2) - 0) + 1 : 1) + "px";
}