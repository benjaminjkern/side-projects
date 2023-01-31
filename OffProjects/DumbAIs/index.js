import { drawBullets, moveBullets } from "./modules/bullet.js";
import {
    drawTemplateBar,
    loser,
    newRound,
    drawBots,
    moveBots,
    starterTemplates,
} from "./modules/game.js";
import { initGraphs, switchShowingGraph } from "./modules/graph.js";
import { drawEloInfo } from "./modules/info.js";
import {
    breakLoopOnRound,
    paused,
    playArea,
    restartScene,
    t,
    toggleBreakLoopOnRound,
    toggleFastMode,
    togglePause,
    updatesPerFrame,
    updateTime,
} from "./modules/scene.js";

const fps = 12;
const SYNCHRONIZED_DRAW = true;
const ROUND_LENGTH = 1500;

let ctx;

// unused
// let GRAPH_SORT_BY_SPECIES = false;

window.onload = () => {
    const canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = playArea.width;
    canvas.height = playArea.height;

    const canvas2holder = document.getElementById("canvas2-holder");
    canvas2holder.style.width = 200;
    canvas2holder.style.height = playArea.height;

    initGraphs(document);

    init();
    startLoop();
};

const init = () => {
    starterTemplates();
    newRound();
    restartScene();
};

const startLoop = () => {
    doLoop();
    if (!SYNCHRONIZED_DRAW) drawLoop();
};

const doLoop = () => {
    if (paused) return;
    setTimeout(doLoop, 1);
    for (let i = 0; i < updatesPerFrame * !paused; i++) {
        if (update()) break;
    }
    if (SYNCHRONIZED_DRAW) draw();
};

const drawLoop = () => {
    if (paused) return;
    setTimeout(drawLoop, 1000 / fps);
    draw();
};

const update = () => {
    updateTime();
    if (t >= ROUND_LENGTH) {
        loser(-1);
        return breakLoopOnRound;
    }

    moveBots();

    moveBullets();
};

const draw = () => {
    ctx.clearRect(0, 0, playArea.width, playArea.height);

    drawBots(ctx);

    drawTemplateBar(ctx);

    drawBullets(ctx);

    drawEloInfo();
};

window.onresize = () => {
    draw(ctx);
};

window.onclick = () => {};
window.onkeydown = (e) => {
    if (e.key === "p") {
        if (!togglePause()) startLoop();
    }
    if (e.key === "s") toggleFastMode();
    if (e.key === "r") toggleBreakLoopOnRound();
    if (e.key === "e") switchShowingGraph();
};
