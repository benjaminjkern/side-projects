const databaseCalls = require('./databaseCalls');

const START_SCORE = 1;
const ALPHA = 0.005;
const BASE = 2;
const FACTOR = 1;

const P = (player1, player2) => 1 / (1 + BASE ** ((player1.score - player2.score) / FACTOR));

const playGame = async (orderOut, buyin) => {
    const players = await databaseCalls.getPlayers(orderOut, name => ({ name, profit: 0, score: START_SCORE, games: 0, wins: 0, draws: 0, losses: 0, bestHand: "", secondBestHand: "", thirdBestHand: "" }));

    const playerBuyins = orderOut.reduce((p, c) => ({ ...p, [c]: (p[c] || 0) + 1 }), {});

    for (const name in playerBuyins) {
        const player = players[name];
        player.games++;
        player.losses++;
        player.profit -= buyin * playerBuyins[name];
    }
    const winner = players[orderOut[orderOut.length - 1]];
    const secondPlace = players[orderOut[orderOut.length - 2]];

    winner.losses--;
    winner.wins++;
    winner.profit += buyin * (orderOut.length - 1);

    secondPlace.losses--;
    secondPlace.draws++;
    secondPlace.profit += buyin;

    for (const name of orderOut) {
        playerBuyins[name]--;
        makeAdjustments(players[name], Object.keys(playerBuyins).filter(player => playerBuyins[player] > 0 && player !== name).map(playerName => players[playerName]), buyin);
    }
    await databaseCalls.newGames([{ players: orderOut, buyin }]);
    await databaseCalls.setPlayers(players);
    return true;
}

const makeAdjustments = (loser, winners, weight) => {
    for (const winner of winners) {
        const expected = P(loser, winner);
        loser.score -= ALPHA * weight * expected / winners.length;
        winner.score += ALPHA * weight * expected / winners.length;
    }
}

module.exports = { playGame };