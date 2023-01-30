window.onload = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 800;

    canvas2holder = document.getElementById("canvas2-holder");
    canvas2holder.style.width = window.innerWidth - 800;
    canvas2holder.style.height = 800;

    const NUM_GRAPHS = 3;

    for (let g = 0; g < NUM_GRAPHS; g++) {
        const graphCanvas = document.getElementById("graph" + g);
        graphs.push({
            canvas: graphCanvas,
            ctx: graphCanvas.getContext("2d"),
        });

        graphCanvas.width = window.innerWidth - 800;
        graphCanvas.height = 800;
        if (g !== showingGraph) graphCanvas.style.display = "none";
    }

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
                BREAK_LOOP_ON_ROUND;
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
            ...addVec(
                bot.pos,
                multConstVec(RADIUS, unitVecFromAngle(bot.angle))
            )
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
        document.getElementById("eloScores").innerText = `Highest: ${
            templates[0].elo
        }, Median: ${
            templates[Math.floor(templates.length / 2) - 1].elo
        }, Lowest: ${templates[templates.length - 1].elo}, Mean: ${
            templates.reduce((p, c) => p + c.elo, 0) / templates.length
        }\nLeft: ${bots[0].elo}, Right: ${bots[1].elo}`;
};
