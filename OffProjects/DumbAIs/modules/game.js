import { DEBUG, randomColor } from "./utils";
import { removeAllBullets } from "./bullet";
import { addLineToGraph, addLineToLineGraph } from "./graph";

import { mutateBrain, newBrain } from "./AI";

export let roundNum = 0;

const KILL_LOSER = false;

export let lastTemplates = {};
export let templates = [];

const MAX_TEMPLATES = 100;
let templateIndex = 0;
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

export const setLastTemplates = () => {
    lastTemplates = templates.reduce((p, { id }) => ({ ...p, [id]: true }), {});
};

export const removeTemplate = (templateId) => {
    templates = templates.filter((x) => x.id !== templateId);
};

export const sortAndCapTemplates = () => {
    templates.sort(({ elo: eloA }, { elo: eloB }) => eloB - eloA);
    templates = templates.slice(0, MAX_TEMPLATES);
};

export const drawTemplateBar = (canvas, ctx) => {
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
        removeTemplate(loserTemplate.id);
    }
    newRound();
};

export const newRound = () => {
    sortAndCapTemplates();

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

    setLastTemplates();

    roundNum++;

    generateNewBots();
    removeAllBullets();
    restartScene();
};
