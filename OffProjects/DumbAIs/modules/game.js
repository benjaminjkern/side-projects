import { DEBUG, randomColor, forceFinite } from "./utils.js";
import {
    addVec,
    multConstVec,
    subVec,
    unitVecFromAngle,
    vecDistSquared,
    vecDot,
} from "./vecMath.js";
import { removeAllBullets, bullets, newBullet } from "./bullet.js";
import { addLineToGraph, addLineToLineGraph } from "./graph.js";
import { mutateBrain, newBrain, resetBrain, runBrain } from "./AI.js";
import { breakLoopOnRound, playArea, restartScene, t } from "./scene.js";

const KILL_LOSER = false;
const MAX_TEMPLATES = 100;
const RADIUS = 25;
const RECORDING_KILLS = false;

export let templates = [];
export let bots = [];

let templateIndex = 0;
let roundNum = 0;

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

export const drawTemplateBar = (ctx) => {
    templates.sort(({ elo: eloA }, { elo: eloB }) => eloB - eloA);

    const WIDTH = playArea.width / templates.length;
    for (const [i, template] of templates.entries()) {
        ctx.fillStyle = template.color;
        ctx.fillRect(
            Math.floor(i * WIDTH),
            playArea.height - 20,
            Math.ceil(WIDTH),
            20
        );
    }
};

export const loser = (loserIndex) => {
    const loserBot = bots.splice(loserIndex === -1 ? 1 : loserIndex, 1)[0];
    const winnerBot = bots[0];
    if (DEBUG) console.log("AWOOGA", winnerBot.elo, loserBot.elo);
    const P = 1 / (1 + 10 ** ((loserBot.elo - winnerBot.elo) / 400));
    const diff = 40 * ((loserIndex === -1 ? 0.5 : 1) - P);

    const winnerTemplate = templates.find((x) => x.id === winnerBot.id);
    const loserTemplate = templates.find((x) => x.id === loserBot.id);
    winnerTemplate.elo += diff;
    loserTemplate.elo -= diff;
    if (DEBUG) console.log("AWOOGA", winnerTemplate.elo, loserTemplate.elo);
    if (KILL_LOSER && loserIndex !== -1) {
        templates = templates.filter((x) => x.id !== loserTemplate.id);
    }
    newRound();
};

export const newRound = () => {
    templates.sort(({ elo: eloA }, { elo: eloB }) => eloB - eloA);
    templates = templates.slice(0, MAX_TEMPLATES);

    // if (templates.length > 0) {
    //     const median = templates[Math.floor(templates.length / 2) - 1].elo;
    //     templates.forEach((template) => {
    //         template.elo -= median;
    //     });
    // }

    if (roundNum > 0) {
        let suffix = templates[0].longName;
        for (const { longName } of templates) {
            for (let i = 0; i < suffix.length; i++) {
                if (suffix[i] === longName[i]) continue;
                suffix = suffix.substring(0, i);
            }
            if (!suffix.length) break;
        }
        if (suffix.length)
            templates.forEach(
                (template) =>
                    (template.longName = template.longName.substring(
                        suffix.length
                    ))
            );
    }

    addLineToLineGraph(0, (template) => template.elo);

    // if (templates.some(({ id }) => !lastTemplates[id])) {
    addLineToGraph(2);
    templates.sort(({ longName: longNameA }, { longName: longNameB }) =>
        longNameA > longNameB ? 1 : -1
    );
    addLineToGraph(1);
    // }

    // lastTemplates = templates.reduce((p, { id }) => ({ ...p, [id]: true }), {});

    roundNum++;

    let a =
        templates[Math.floor(Math.random() * templates.length)] ||
        newTemplate();
    let b =
        templates[Math.floor(Math.random() * templates.length)] ||
        newTemplate();

    if (Math.random() > 0.5 || a === b) b = newTemplate(b);
    bots = [newBot(a), newBot(b, true)];

    bots.forEach((bot) => resetBrain(bot.brain));
    removeAllBullets();
    restartScene();
};

const startingPos = (canvas, rightSide) => [
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
                if (breakLoopOnRound) return breakLoopOnRound;
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

        if (bot.pos[0] + RADIUS >= playArea.width)
            bot.pos[0] = playArea.width - RADIUS;
        if (bot.pos[0] - RADIUS <= 0) bot.pos[0] = RADIUS;
        if (bot.pos[1] + RADIUS >= playArea.height)
            bot.pos[1] = playArea.height - RADIUS;
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

export const drawBots = (ctx) => {
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
