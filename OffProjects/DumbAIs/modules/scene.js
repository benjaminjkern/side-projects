import { drawBots, drawTemplateBar, moveBots } from "./bot";
import { drawBullets, moveBullets } from "./bullet";
import { loser, newRound } from "./game";
import { graphs, setShowingGraph, showingGraph } from "./graph";
import { drawEloInfo } from "./info";

const fps = 12;
const synchronizedDraw = true;

const MAX_UPDATES_PER_FRAME = 30000;

const ROUND_LENGTH = 1500;

export let canvas;
export let ctx;
export let canvas2holder;

export let paused = false;
export let updatesPerFrame = 1;
export let breakLoopOnRound = true;

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

    moveBullets(canvas);
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

export const initCanvas = (document, window) => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 800;

    canvas2holder = document.getElementById("canvas2-holder");
    canvas2holder.style.width = window.innerWidth - 800;
    canvas2holder.style.height = 800;
};

export const init = () => {
    // while (templates.length < MAX_TEMPLATES) newTemplate();
    newRound();
    t = 0;
};

export const startLoop = () => {
    doLoop();
    if (!synchronizedDraw) drawLoop();
};

export const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBots(ctx);

    drawTemplateBar(ctx);

    drawBullets(ctx);

    drawEloInfo();
};

export const keyHandler = (e) => {
    if (e.key === "p") paused = !paused;
    if (e.key === "s")
        updatesPerFrame = MAX_UPDATES_PER_FRAME + 1 - updatesPerFrame;
    if (e.key === "r") breakLoopOnRound = !breakLoopOnRound;
    if (e.key === "e") {
        graphs[showingGraph].canvas.style.display = "none";
        setShowingGraph((showingGraph + 1) % graphs.length);
        graphs[showingGraph].canvas.style.display = "block";
    }
};
