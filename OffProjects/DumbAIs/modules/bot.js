import { mutateBrain, newBrain, resetBrain, runBrain } from "./AI";
import { bullets, newBullet } from "./bullet";
import { loser } from "./game";
import { playArea } from "./playArea";
import { breakLoopOnRound, t } from "./scene";
import { forceFinite, randomColor } from "./utils";
import {
    addVec,
    multConstVec,
    subVec,
    unitVecFromAngle,
    vecDistSquared,
    vecDot,
} from "./vecMath";

export let lastTemplates = {};
export let templates = [];
export let bots = [];

const RADIUS = 25;
const MAX_TEMPLATES = 100;

const RECORDING_KILLS = false;

let templateIndex = 0;

console.log("RUNNING BOT");

const startingPos = (rightSide) => [
    (playArea.width * (1 + 2 * rightSide)) / 4,
    playArea.height / 2,
];

export const newBot = (template = newTemplate(), rightSide = false) => {
    return {
        ...template,
        pos: startingPos(rightSide),
        angle: !rightSide * Math.PI,
        bulletTimer: 0,
        rightSide,
    };
};

export const newTemplate = (oldTemplate) => {
    const template = {
        longName:
            oldTemplate?.longName !== undefined
                ? `${oldTemplate.longName},${templateIndex}`
                : `${templateIndex}`,
        id: templateIndex,
        color: randomColor(oldTemplate?.color),
        brain: oldTemplate ? mutateBrain(oldTemplate.brain, 0.1) : newBrain(),
        elo: 0,
    };
    templateIndex++;
    templates.push(template);
    return template;
};

export const setLastTemplates = () => {
    lastTemplates = templates.reduce((p, { id }) => ({ ...p, [id]: true }), {});
};

export const removeTemplate = (templateId) => {
    templates = templates.filter((x) => x.id !== templateId);
};

export const sortAndCapTemplates = () => {
    templates.sort(({ elo: eloA }, { elo: eloB }) => eloB - eloA);
    templates = templates.slice(0, MAX_TEMPLATES);
};

export const generateNewBots = () => {
    let a =
        templates[Math.floor(Math.random() * templates.length)] ||
        newTemplate();
    let b =
        templates[Math.floor(Math.random() * templates.length)] ||
        newTemplate();

    if (Math.random() > 0.5 || a === b) b = newTemplate(b);
    bots = [newBot(a), newBot(b, true)];

    bots.forEach((bot) => resetBrain(bot.brain));
};

export const drawTemplateBar = () => {
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
};

export const moveBots = () => {
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
                if (RECORDING_KILLS) console.log("Kill");

                loser(+bot.rightSide);
                if (breakLoopOnRound) return;
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

        if (bot.pos[0] + RADIUS >= canvas.width)
            bot.pos[0] = canvas.width - RADIUS;
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
};

export const drawBots = () => {
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
};
