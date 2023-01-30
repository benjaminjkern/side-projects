import { drawBots, drawTemplateBar, moveBots } from "./bot";
import { drawBullets, moveBullets, newBullet } from "./bullet";
import { loser } from "./game";
import { drawEloInfo } from "./info";

const { graphs, setShowingGraph, showingGraph } = require("./graph");

let updatesPerFrame = 1;
let paused = false;

const MAX_UPDATES_PER_FRAME = 30000;
export let breakLoopOnRound = true;

let canvas, ctx, canvas2holder;

const fps = 12;
const synchronizedDraw = true;

/**********************
 * DEFAULT CONFIGURATION
 **********************/

let ROUND_LENGTH = 1500;
let GRAPH_SORT_BY_SPECIES = false;

export let t;

export const restartScene = () => {
    t = 0;
};

const update = () => {
    t++;
    if (t >= ROUND_LENGTH) {
        loser(-1);
        return breakLoopOnRound;
    }

    moveBots();

    moveBullets();
};

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBots();

    drawTemplateBar();

    drawBullets();

    drawEloInfo();
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
