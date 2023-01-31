import { bots, gameNum, roundNum, templates } from "./game.js";

export const drawEloInfo = () => {
    if (templates.length < 2) return;

    document.getElementById("eloScores").innerText = `Highest: ${
        templates[0].elo
    }, Median: ${
        templates[Math.floor(templates.length / 2) - 1].elo
    }, Lowest: ${templates[templates.length - 1].elo}, Mean: ${
        templates.reduce((p, c) => p + c.elo, 0) / templates.length
    }\nLeft: ${bots[0].elo}, Right: ${bots[1].elo}\nOldest: ${Math.max(
        ...templates.map((template) => template.age)
    )}, Average age: ${
        templates.reduce((p, c) => p + c.age, 0) / templates.length
    }\nRound Num: ${roundNum}, Game Num: ${gameNum}`;
};
