let canvas, ctx, canvas2holder, canvas2, ctx2;

window.onload = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas2holder = document.getElementById("canvas2-holder");
    canvas2 = document.getElementById("canvas2");
    ctx2 = canvas2.getContext("2d");

    canvas.width = 800;
    canvas.height = 800;
    canvas2holder.style.width = window.innerWidth - 800;
    canvas2holder.style.height = 800;
    canvas2.width = window.innerWidth - 800;
    canvas2.height = 1;

    init();
    startLoop();
};

window.onresize = () => {
    draw();
};

const startLoop = () => {
    doLoop();
    if (!synchronizedDraw) drawLoop();
};

const doLoop = () => {
    setTimeout(doLoop, 1);
    for (let i = 0; i < updatesPerFrame * !paused; i++) {
        if (update()) break;
    }
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

let templateIndex = 0;
const newTemplate = (oldTemplate) => {
    const template = {
        longName: oldTemplate?.longName !== undefined ? `${oldTemplate.longName},${templateIndex}` : `${templateIndex}`,
        id: templateIndex,
        color: randomColor(oldTemplate?.color),
        brain: oldTemplate ? mutateBrain(oldTemplate.brain, 0.1) : newBrain(),
        elo: 1000,
    };
    templateIndex++;
    templates.push(template);
    return template;
};

const startingPos = (rightSide) => [
    (canvas.width * (1 + 2 * rightSide)) / 4,
    canvas.height / 2,
];

const newBot = (template = newTemplate(), rightSide = false) => {
    return {
        ...template,
        pos: startingPos(rightSide),
        angle: !rightSide * Math.PI,
        bulletTimer: 0,
        rightSide,
    };
};

const newBullet = (bot, big) => {
    const SPEED = 5;
    const key = Math.random();
    bullets[key] = {
        radius: BULLET_RADIUS * (big ? 2 : 1),
        owner: bot,
        key,
        pos: bot.pos,
        v: multConstVec(SPEED / (big ? 2 : 1), unitVecFromAngle(bot.angle)),
    };
};

let templates = [];
let bots = [];
let bullets = {};
let t;

let MAX_TEMPLATES = 100;
let RADIUS = 25;
let ROUND_LENGTH = 1500;
let BULLET_RADIUS = 5;
let MAX_UPDATES_PER_FRAME = 30000;
let BREAK_LOOP_ON_ROUND = true;

let recordingKills = false;
let updatesPerFrame = 1;
let paused = false;
let roundNum = 0;

let debug = false;

/**********************
 * THE REST
 **********************/
const init = () => {
    // while (templates.length < MAX_TEMPLATES) newTemplate();
    newRound();
    t = 0;
};

const update = () => {
    t++;
    if (t >= ROUND_LENGTH) {
        loser(-1);
        return BREAK_LOOP_ON_ROUND;
    }
    for (const bot of bots) {
        const enemy = bots[1 - bot.rightSide];
        const diff = subVec(bot.pos, enemy.pos);
        const c = vecDot(diff, diff) - RADIUS ** 2;

        const dist = (angle, diff, c) => {
            const u = unitVecFromAngle(angle);
            const b = 2 * vecDot(u, diff);
            const det = b ** 2 - 4 * c;
            if (det < 0) return -1;
            const x = (b + Math.sqrt(det)) / -2;
            if (x < 0) return -1;
            return x;
        };

        const enemyBullets = Object.keys(bullets)
            .map((bulletKey) => bullets[bulletKey])
            .filter((bullet) => bullet.owner !== bot);

        const bulletCs = enemyBullets.map((bullet) => {
            const bDiff = subVec(bot.pos, bullet.pos);
            return [bDiff, vecDot(bDiff, bDiff) - bullet.radius ** 2];
        });

        const angles = Array(7)
            .fill()
            .map((_, i) => bot.angle + (Math.PI / 4 / 6) * (i - 3));

        const enemyDists = angles.map((angle) => dist(angle, diff, c));
        const bulletDists = angles.map((angle) => {
            let closestBullet = Number.MAX_SAFE_INTEGER;
            for (const [bDiff, c] of bulletCs) {
                let bulletDist = dist(angle, bDiff, c);
                if (bulletDist === -1 || bulletDist >= closestBullet) continue;
                closestBullet = bulletDist;
            }
            if (closestBullet === Number.MAX_SAFE_INTEGER) return -1;
            return closestBullet;
        });

        for (const bullet of enemyBullets) {
            const distSquared = vecDistSquared(bot.pos, bullet.pos);
            if (distSquared < (bullet.radius + RADIUS) ** 2) {
                // if (t < 10) console.log("Boot!", distSquared, bullets);
                if (recordingKills) console.log("Kill");
                loser(+bot.rightSide);
                BREAK_LOOP_ON_ROUND
                return BREAK_LOOP_ON_ROUND;
            }
        }
        bot.brain.inputData = [t, ...enemyDists, ...bulletDists, 1];
        runBrain(bot.brain, 32);
        const [speed, angleSpeed, shoot, shootBig] = bot.brain.outputData;
        const u = unitVecFromAngle(bot.angle);

        bot.angle += Math.min(Math.max(forceFinite(angleSpeed), -0.1), 0.1);
        bot.pos = addVec(
            bot.pos,
            multConstVec(Math.min(Math.max(forceFinite(speed), -5), 5), u)
        );

        if (bot.pos[0] + RADIUS >= canvas.width) bot.pos[0] = canvas.width - RADIUS;
        if (bot.pos[0] - RADIUS <= 0) bot.pos[0] = RADIUS;
        if (bot.pos[1] + RADIUS >= canvas.height)
            bot.pos[1] = canvas.height - RADIUS;
        if (bot.pos[1] - RADIUS <= 0) bot.pos[1] = RADIUS;

        bot.bulletTimer--;

        if (bot.bulletTimer <= 0) {
            if (shoot >= 0 || shootBig >= 0) {
                bot.bulletTimer = 100;
                newBullet(bot, shootBig > shoot);
            }
        }
    }

    for (const bulletKey in bullets) {
        const bullet = bullets[bulletKey];

        bullet.pos = addVec(bullet.pos, bullet.v);
        if (
            bullet.pos[0] - bullet.radius >= canvas.width ||
            bullet.pos[0] + bullet.radius <= 0 ||
            bullet.pos[1] - bullet.radius >= canvas.height ||
            bullet.pos[1] + bullet.radius <= 0
        ) {
            delete bullets[bulletKey];
        }
    }
};

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const [i, bot] of bots.entries()) {
        ctx.fillStyle = bot.color;
        ctx.beginPath();
        ctx.arc(...bot.pos, RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.moveTo(...bot.pos);
        ctx.lineTo(
            ...addVec(bot.pos, multConstVec(RADIUS, unitVecFromAngle(bot.angle)))
        );
        ctx.stroke();
    }
    templates.sort(({ elo: eloA }, { elo: eloB }) => eloB - eloA);
    const WIDTH = canvas.width / templates.length;
    for (const [i, template] of templates.entries()) {
        ctx.fillStyle = template.color;
        ctx.fillRect(
            Math.floor(i * WIDTH),
            canvas.height - 20,
            Math.ceil(WIDTH),
            20
        );
    }
    for (const bulletKey in bullets) {
        const bullet = bullets[bulletKey];
        ctx.fillStyle = "pink";
        ctx.beginPath();
        ctx.arc(...bullet.pos, bullet.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
    if (templates.length >= 2)
        document.getElementById('eloScores').innerText = `Highest: ${templates[0].elo}, Lowest: ${templates[templates.length - 2].elo}`
};
/*************
 * Methods
 */

const randomColor = (color, mutation = 1) => {
    if (!color) return `#${Math.random().toString(16).substring(2, 8)}`;
    const rgb = [
        parseInt(color.substring(1, 3), 16),
        parseInt(color.substring(3, 5), 16),
        parseInt(color.substring(5, 7), 16),
    ];
    while (Math.random() > 0.01) {
        const r = Math.floor(Math.random() * 3);
        rgb[r] = Math.max(
            0,
            Math.min(
                255,
                rgb[r] + (Math.floor(Math.random() * (mutation * 2 + 1)) - mutation)
            )
        );
    }
    return `#${rgb.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

const loser = (loserIndex) => {
    const loserBot = bots.splice(loserIndex === -1 ? 0 : loserIndex, 1)[0];
    const winnerBot = bots[0];
    if (debug) console.log("AWOOGA", winnerBot.elo, loserBot.elo);
    const P = 1 / (1 + 10 ** ((loserBot.elo - winnerBot.elo) / 400));
    const diff = 40 * ((loserIndex === -1 ? 0.5 : 1) - P);
    const winnerTemplate = templates.find((x) => x.id === winnerBot.id);
    const loserTemplate = templates.find((x) => x.id === loserBot.id);
    winnerTemplate.elo += diff;
    loserTemplate.elo -= diff;
    if (debug) console.log("AWOOGA", winnerTemplate.elo, loserTemplate.elo);
    newRound();
};
const newRound = () => {
    templates.sort(({ elo: eloA }, { elo: eloB }) => eloB - eloA);
    templates = templates.slice(0, MAX_TEMPLATES);

    templates.sort(({ longName: longNameA }, { longName: longNameB }) => longNameA > longNameB ? 1 : -1);


    if (roundNum > 0) {
        const temp = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
        if (roundNum <= 800) {
            canvas2.height = roundNum;
            ctx2.putImageData(temp, 0, 0);
        } else {
            ctx2.putImageData(temp, 0, -1);
        }

        let suffix = templates[0].longName;
        for (const { longName } of templates) {
            for (let i = 0; i < suffix.length; i++) {
                if (suffix[i] === longName[i]) continue;
                suffix = suffix.substring(0, i);
            }
            if (!suffix.length) break;
        }
        if (suffix.length) templates.forEach(template => template.longName = template.longName.substring(suffix.length));
    }


    const WIDTH2 = canvas2.width / templates.length;
    for (const [i, template] of templates.entries()) {
        ctx2.fillStyle = template.color;
        if (roundNum <= 800) {
            ctx2.fillRect(Math.floor(i * WIDTH2), roundNum - 1, Math.ceil(WIDTH2), 1);
        } else {
            ctx2.fillRect(Math.floor(i * WIDTH2), 799, Math.ceil(WIDTH2), 1);
        }
    }

    roundNum++;

    let a =
        templates[Math.floor(Math.random() * templates.length)] || newTemplate();
    let b =
        templates[Math.floor(Math.random() * templates.length)] || newTemplate();

    if (Math.random() > 0.5 || a === b) b = newTemplate(b);
    bots = [newBot(a), newBot(b, true)];

    bots.forEach((bot) => restartBrain(bot.brain));
    bullets = {};
    t = 0;
};

const forceFinite = (x) => {
    if (Number.isFinite(x)) return x;
    return 0;
};

window.onclick = () => { };
window.onkeydown = (e) => {
    if (e.key === "p") paused = !paused;
    if (e.key === "s")
        updatesPerFrame = MAX_UPDATES_PER_FRAME + 1 - updatesPerFrame;
    if (e.key === 'r')
        BREAK_LOOP_ON_ROUND = !BREAK_LOOP_ON_ROUND;
};