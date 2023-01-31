import { initGraphs } from "./modules/graph";
import {
    draw,
    init,
    initCanvas,
    keyHandler,
    playArea,
    startLoop,
} from "./modules/scene";

export let canvas;
export let ctx;
export let canvas2holder;
// unused
// let GRAPH_SORT_BY_SPECIES = false;

window.onload = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = playArea.width;
    canvas.height = playArea.height;

    canvas2holder = document.getElementById("canvas2-holder");
    canvas2holder.style.width = 200;
    canvas2holder.style.height = 800;

    initGraphs(document, window);

    init();
    startLoop();
};

window.onresize = () => {
    draw(ctx);
};

window.onclick = () => {};
window.onkeydown = keyHandler;
