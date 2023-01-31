import { addVec, multConstVec, unitVecFromAngle } from "./vecMath";

const BULLET_RADIUS = 5;

export let bullets = {};

export const newBullet = (bot, big) => {
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

export const moveBullets = (canvas) => {
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
export const drawBullets = (ctx) => {
    for (const bulletKey in bullets) {
        const bullet = bullets[bulletKey];
        ctx.fillStyle = "pink";
        ctx.beginPath();
        ctx.arc(...bullet.pos, bullet.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
};

export const removeAllBullets = () => {
    bullets = {};
};
