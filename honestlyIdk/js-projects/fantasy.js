const parseTeam = (teamString) => {
    const [captain, ...team] = teamString.split(/\s*;\s*/);
    return {
        captain,
        team: team.map((player) => {
            const [position, projScore] = player.split(" ");
            return { position, projScore: Number(projScore) };
        }),
    };
};

const allTeams = [
    parseTeam(
        "ben; QB 17.8; RB 13.3; RB 12.6; WR 16.4; WR 13.9; TE 10.8; WR 14.6; DST 8.2; K 8.7; WR 0; RB 0; K 8.4; QB 0; RB 0; RB 10.8; WR 13.3"
    ),
    parseTeam(
        "andrew; QB 21.3; RB 19; RB 16.5; WR 14.8; WR 15.8; TE 10; RB 17.9; DST 7.8; K 8.2; RB 18.5; WR 13.8; RB 12; WR 0; WR 12.8; RB 10.4; QB 15.9"
    ),
    parseTeam(
        "mac; QB 23; RB 17; RB 16.7; WR 18.7; WR 15.5; TE 7.2; WR 17.1; DST 8; K 8.3; WR 14.0; QB 0; RB 0; DST 4.7; RB 10; WR 10.5"
    ),
    parseTeam(
        "brandon; QB 20.2; RB 12.2; RB 13.6; WR 20.2; WR 15.3; TE 10.6; WR 14.9; DST  8.2; K 8.8; RB 0; QB 0; TE 8.8; DST 4.2; WR 11.6; RB 6.7; K 7.7"
    ),
    parseTeam(
        "soph; QB 20.1; RB 14.2; RB 15.9; WR 14.8; WR 14.4; TE 0; RB 0; DST 8.6; K 7; QB 18.6; RB 8; WR 0; WR 9.2; DST 4.2; TE 7.9; RB 12"
    ),
    parseTeam(
        "stephen; QB 16.2; RB 2.1; RB 18.8; WR 21.8; WR 15.7; TE 9.1; WR 13.8; DST 0; K 7.3; RB 12.1; QB 14.7; TE 0; RB 0; WR 6.9; WR 8.1; WR 9.4"
    ),
    parseTeam(
        "josh; QB 21.6; RB 14.5; RB 19.5; WR 21.6; WR 13.4; TE 14.6; TE 7.2; DST 5.2; K 8.5; RB 0; TE 10.4; K 8.1; DST 6.6; QB 14; RB 4.9; WR 0; WR 0"
    ),
];

const maxInPerTeam = {
    QB: 1,
    RB: 2,
    WR: 2,
    TE: 1,
    FLX: 1,
    DST: 1,
    K: 1,
};

// Assume flex is filled with best of remaining
const calcProjScore = (team) => {
    let remainingTeam = [...team];
    const chosenTeam = []; // not really used right now but can be
    const projectedScore = Object.keys(maxInPerTeam).reduce((sum, position) => {
        const selectedPlayers = remainingTeam
            .map((player, i) => [player, i])
            .filter(([player]) => {
                // Assume FLX means RB or WB or TE
                if (position === "FLX")
                    return ["RB", "WR", "TE"].includes(player.position);
                return player.position === position;
            })
            .sort(([a], [b]) => b.projScore - a.projScore)
            .slice(0, maxInPerTeam[position]);

        chosenTeam.push(...selectedPlayers.map(([player]) => player));
        remainingTeam = remainingTeam.filter(
            (player, i) =>
                !selectedPlayers.some(([player, index]) => index === i)
        );
        return (
            sum +
            selectedPlayers.reduce((p, [player]) => p + player.projScore, 0)
        );
    }, 0);
    return [projectedScore, chosenTeam];
};

let hitLimit = false;

const findBestTrades = (captainName, allTeamsTemp, depth = 1) => {
    const getBestResultsForEveryoneElse = (bestResultSubtrade) =>
        Object.keys(bestResultSubtrade).reduce(
            (p, c) => p + (c === captainName ? 0 : bestResultSubtrade[c]),
            0
        );
    let bestTrades = [];
    let bestResult = { [captainName]: 0 };

    if (depth === 0) {
        hitLimit = true;
        return [];
    }
    const goodTrades = [];

    const team1Index = allTeamsTemp.findIndex(
        (team) => team.captain === captainName
    );
    const team1 = allTeamsTemp[team1Index].team;
    for (const [
        team2Index,
        { captain, team: team2 },
    ] of allTeamsTemp.entries()) {
        if (captain === captainName) continue;

        // Naive
        const [team1Score, bestTeam1] = calcProjScore(team1);
        const [team2Score, bestTeam2] = calcProjScore(team2);
        for (let i1 = 0; i1 < team1.length; i1++) {
            for (let i2 = 0; i2 < team2.length; i2++) {
                const tradeTeam1 = [
                    ...team1.slice(0, i1),
                    team2[i2],
                    ...team1.slice(i1 + 1),
                ];
                const tradeTeam2 = [
                    ...team2.slice(0, i2),
                    team1[i1],
                    ...team2.slice(i2 + 1),
                ];
                const [newTeam1Score, newBestTeam1] = calcProjScore(tradeTeam1);
                const [newTeam2Score, newBestTeam2] = calcProjScore(tradeTeam2);
                if (
                    newTeam1Score - team1Score >= 0.05 &&
                    newTeam2Score - team2Score >= 0.05
                ) {
                    const newAllTeams = [...allTeamsTemp];
                    newAllTeams[team1Index] = {
                        captain: captainName,
                        team: tradeTeam1,
                    };
                    newAllTeams[team2Index] = {
                        captain: captain,
                        team: tradeTeam2,
                    };

                    const subtrades = findGoodTrades(
                        captainName,
                        newAllTeams,
                        depth - 1
                    );

                    const result = {
                        [captainName]: newTeam1Score - team1Score,
                        [captain]: newTeam2Score - team2Score,
                    };

                    // Check if trade is the best trade

                    const opTeam = captain;
                    const trade = [i1, i2];

                    const [bestTradesSubtrade, bestResultSubtrade] =
                        getBestTradeResults(subtrades, captainName);
                    bestTradesSubtrade.splice(0, 0, { opTeam, trade });
                    addToResults(bestResultSubtrade, result);

                    const resultsForEveryoneElseSubtrade =
                        getBestResultsForEveryoneElse(bestResultSubtrade);
                    const resultsForEveryoneElse =
                        getBestResultsForEveryoneElse(bestResult);

                    if (
                        bestResultSubtrade[captainName] >
                            bestResult[captainName] ||
                        (bestResultSubtrade[captainName] ===
                            bestResult[captainName] &&
                            (resultsForEveryoneElseSubtrade <
                                resultsForEveryoneElse ||
                                (resultsForEveryoneElseSubtrade ===
                                    resultsForEveryoneElse &&
                                    bestTradesSubtrade.length <
                                        bestTrades.length)))
                    ) {
                        bestTrades = bestTradesSubtrade;
                        bestResult = bestResultSubtrade;
                    }
                }
            }
        }
    }
    return [bestTrades, bestResult];
};

const roundN = (x, N = 1) => {
    return Math.round(x * 10 ** N) / 10 ** N;
};

const addToResults = (results, newResults) => {
    for (const captainName of Object.keys(newResults)) {
        results[captainName] =
            (results[captainName] || 0) + newResults[captainName];
    }
};

/**
 *
 */

const me = "ben";
const recurseNum = 5;

const [bestTrades, results] = findBestTrades(me, allTeams, recurseNum);

bestTrades.map(({ opTeam, trade: [team1Index, team2Index] }) => {
    const player1 = allTeams.find(({ captain }) => captain === me).team[
        team1Index
    ];
    const player2 = allTeams.find(({ captain }) => captain === opTeam).team[
        team2Index
    ];
    console.log(
        "Trade your player",
        team1Index,
        player1,
        "with <",
        opTeam,
        ">'s player",
        team2Index,
        player2
    );
});
console.log("Result:", results);
if (!hitLimit) console.log("Exhausted all options.");
else console.log("Did not finish recursing.");
