import { initGraphs } from "./modules/graph";
import { draw, init, initCanvas, keyHandler, startLoop } from "./modules/scene";

// unused
// let GRAPH_SORT_BY_SPECIES = false;

window.onload = () => {
    initCanvas(document, window);

    initGraphs(document, window);

    init();
    startLoop();
};

window.onresize = () => {
    draw();
};

window.onclick = () => {};
window.onkeydown = keyHandler;
