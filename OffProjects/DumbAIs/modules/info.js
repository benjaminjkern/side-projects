import { bots, gameNum, roundNum, templates } from "./game.js";

export const drawEloInfo = () => {
    if (templates.length < 2) return;

    document.getElementById("eloScores").innerText = `Round:\nHighest: ${
        templates[0].elo
    }, Median: ${
        templates[Math.floor(templates.length / 2) - 1].elo
    }, Lowest: ${templates[templates.length - 1].elo}, Mean: ${
        templates.reduce((p, c) => p + c.elo, 0) / templates.length
    }\nOverall:`;

    templates.sort(({ overallElo: eloA }, { overallElo: eloB }) => eloB - eloA);

    document.getElementById("eloScores").innerText += `\nHighest: ${
        templates[0].overallElo
    }, Median: ${
        templates[Math.floor(templates.length / 2) - 1].overallElo
    }, Lowest: ${templates[templates.length - 1].overallElo}, Mean: ${
        templates.reduce((p, c) => p + c.overallElo, 0) / templates.length
    }\nOldest: ${Math.max(
        ...templates.map((template) => template.age)
    )}, Average age: ${
        templates.reduce((p, c) => p + c.age, 0) / templates.length
    }\n\nRound Num: ${roundNum}, Game Num: ${gameNum}\n\nLeft: ${
        bots[0].elo
    }, Right: ${bots[1].elo}`;
};
