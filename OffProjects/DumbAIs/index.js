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

window.onclick = () => {};
window.onkeydown = (e) => {
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
