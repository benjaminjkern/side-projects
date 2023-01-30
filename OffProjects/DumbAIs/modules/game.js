import {
    bots,
    generateNewBots,
    removeTemplate,
    setLastTemplates,
    sortAndCapTemplates,
    templates,
} from "./bot";
import { removeAllBullets } from "./bullet";
import { addLineToGraph, addLineToLineGraph } from "./graph";
import { restartScene } from "./scene";
import { DEBUG } from "./utils";

export let roundNum = 0;

const KILL_LOSER = false;

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
