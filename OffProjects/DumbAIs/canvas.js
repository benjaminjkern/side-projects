let canvas, ctx;

window.onload = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init();
    startLoop();
};

window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
};

const startLoop = () => {
    doLoop();
    if (!synchronizedDraw) drawLoop();
};

const doLoop = () => {
    setTimeout(doLoop, 1);
    update();
    if (synchronizedDraw) draw();
};

const drawLoop = () => {
    setTimeout(drawLoop, 1000 / fps);
    draw();
};

const fps = 12;
const synchronizedDraw = true;

/**********************
 * DEFAULT CONFIGURATION
 **********************/

const newTemplate = () => {
    return {
        color: randomColor(),
        brain: newBrain(),
    };
};

const newBot = (template, rightSide = false) => {
    return {
        ...template,
        pos: [(canvas.width * (1 + 2 * rightSide)) / 4, canvas.height / 2],
        angle: !rightSide * Math.PI,
        bulletTimer: 0,
        rightSide,
    };
};

const newBullet = (bot) => {
    const SPEED = 5;
    const key = Math.random();
    bullets[key] = {
        owner: bot,
        key,
        pos: bot.pos,
        v: multConstVec(SPEED, unitVecFromAngle(bot.angle)),
    };
};

const templates = [];
let bots = [];
let bullets = {};
let t;

const RADIUS = 25;
const ROUND_LENGTH = 1500;
const BULLET_RADIUS = 5;

/**********************
 * THE REST
 **********************/
const init = () => {
    newRound();
    t = 0;
};

const update = () => {
    t++;
    if (t >= ROUND_LENGTH) {
        loser(1);
        return;
    }
    for (const bot of bots) {
        bot.brain.inputData = [bot.pos[0], bot.pos[1], t, 0, 0, 0, 0, 0];
        runBrain(bot.brain);
        const [speed, angleSpeed, shoot] = bot.brain.outputData;

        bot.angle += Math.min(Math.max(angleSpeed, -0.1), 0.1);
        bot.pos = addVec(
            bot.pos,
            multConstVec(speed, unitVecFromAngle(bot.angle))
        );

        if (bot.pos[0] + RADIUS >= canvas.width)
            bot.pos[0] = canvas.width - RADIUS;
        if (bot.pos[0] - RADIUS <= 0) bot.pos[0] = RADIUS;
        if (bot.pos[1] + RADIUS >= canvas.height)
            bot.pos[1] = canvas.height - RADIUS;
        if (bot.pos[1] - RADIUS <= 0) bot.pos[1] = RADIUS;

        bot.bulletTimer--;

        if (shoot >= 0 && bot.bulletTimer <= 0) {
            bot.bulletTimer = 100;
            newBullet(bot);
        }
    }

    for (const bulletKey in bullets) {
        const bullet = bullets[bulletKey];

        bullet.pos = addVec(bullet.pos, bullet.v);
        if (
            bullet.pos[0] - BULLET_RADIUS >= canvas.width ||
            bullet.pos[0] + BULLET_RADIUS <= 0 ||
            bullet.pos[1] - BULLET_RADIUS >= canvas.height ||
            bullet.pos[1] + BULLET_RADIUS <= 0
        ) {
            delete bullets[bulletKey];
        }
        for (const bot of bots) {
            if (bullet.owner === bot) continue;
            if (
                vecDistSquared(bot.pos, bullet.pos) <
                (BULLET_RADIUS + RADIUS) ** 2
            ) {
                loser(+bot.rightSide);
                return;
            }
        }
    }
};

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const bot of bots) {
        ctx.fillStyle = bot.color;
        ctx.beginPath();
        ctx.arc(...bot.pos, RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.moveTo(...bot.pos);
        ctx.lineTo(
            ...addVec(
                bot.pos,
                multConstVec(RADIUS, unitVecFromAngle(bot.angle))
            )
        );
        ctx.stroke();
    }
    for (const bulletKey in bullets) {
        const bullet = bullets[bulletKey];
        ctx.fillStyle = "pink";
        ctx.beginPath();
        ctx.arc(...bullet.pos, BULLET_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
};
/*************
 * Methods
 */

const randomColor = () => `#${Math.random().toString(16).substring(2, 8)}`;

const loser = (loserIndex) => {
    bots.splice(loserIndex, 1);
    newRound(bots[0]);
};
const newRound = (winner = newTemplate()) => {
    bots = [newBot(winner), newBot(newTemplate(), true)];
    bullets = {};
    t = 0;
};
