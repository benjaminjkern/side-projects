const MAX_UPDATES_PER_FRAME = 30000;

export const playArea = { width: 600, height: 600 };

export let paused = false;
export let updatesPerFrame = 1;
export let breakLoopOnRound = true;
export let t;

export const restartScene = () => {
    t = 0;
};

export const updateTime = () => {
    t++;
};

export const togglePause = () => {
    paused = !paused;
    return paused;
};

export const toggleBreakLoopOnRound = () => {
    breakLoopOnRound = !breakLoopOnRound;
};

export const toggleFastMode = () => {
    updatesPerFrame = MAX_UPDATES_PER_FRAME + 1 - updatesPerFrame;
};
