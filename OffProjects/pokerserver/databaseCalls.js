

// This is subject to change with a real server

const GAMES_FILE = 'games.csv';
const PLAYERS_FILE = 'players.csv';

let ALL_GAMES = [];
let ALL_PLAYERS = {};

const getAllGames = async () => {
    readFullDatabase();
    return await new Promise(resolve => resolve(ALL_GAMES));
}
const getAllPlayers = async () => {
    readFullDatabase();
    return await new Promise(resolve => resolve(ALL_PLAYERS))
}

const getGames = async (gameNums) => {
    readFullDatabase();
    return gameNums.map(gameNum => ALL_GAMES[gameNum]);
}
const getPlayers = async (playerNames, defaultIfNotExist) => {
    readFullDatabase();
    return playerNames.reduce((p, playerName) => {
        const name = playerName.toLowerCase();
        // create blank player if player doesnt exist
        if (!ALL_PLAYERS[name])
            ALL_PLAYERS[name] = defaultIfNotExist(name);
        return { ...p, [playerName]: ALL_PLAYERS[name] };
    }, {});
}

const setGames = async (games) => {
    readFullDatabase();
    games.forEach(game => ALL_GAMES[game.gameNum] = game);
    return true;
}

const setPlayers = async (players) => {
    readFullDatabase();
    Object.keys(players).forEach(playerName => ALL_PLAYERS[playerName] = players[playerName]);
    return true;
}

const newGames = async (games) => {
    readFullDatabase();
    games.forEach(game => ALL_GAMES.push({ gameNum: ALL_GAMES.length, ...game }));
    return true;
}

const fs = require('fs');

const readFullDatabase = () => {
    if (Object.keys(ALL_PLAYERS).length === 0 && fs.existsSync(PLAYERS_FILE)) {
        const players = fs.readFileSync(PLAYERS_FILE, 'utf8').split(/\r?\n/g).filter(line => line[0] !== '#');
        players.forEach((player, i) => {
            const [name, profit, score, games, wins, draws, losses, besthand1, besthand2, besthand3] = player.split(/\s*,\s*/g)
            if (name.length === 0) return;
            ALL_PLAYERS[name.toLowerCase()] = {
                name,
                profit: profit - 0 || 0, score: score - 0 || 0, games: games - 0 || 0, wins: wins - 0 || 0, draws: draws - 0 || 0, losses: losses - 0 || 0,
                besthand1: besthand1 || "", besthand2: besthand2 || "", besthand3: besthand3 || ""
            }
        });
    }
    if (ALL_GAMES.length === 0 && fs.existsSync(GAMES_FILE)) {
        const games = fs.readFileSync(GAMES_FILE, 'utf8').split(/\r?\n/g).filter(line => line[0] !== '#');
        games.forEach((game, gameNum) => {
            const [players, buyin] = game.split(/\s*;\s*/g);
            ALL_GAMES.push({ gameNum, players: players.split(/\s*,\s*/g).map(player => player.toLowerCase()), buyin: buyin - 0 });
        });
    }
}

const writeToDatabase = () => {
    // erase file
    fs.writeFileSync(databaseFile, '');
    Object.keys(ALL_PLAYERS).forEach(player => {
        const { profit, score, games, wins, draws, losses, besthand1, besthand2, besthand3 } = ALL_PLAYERS[player];
        fs.appendFileSync(databaseFile, `${player}, ${[profit, score, games, wins, draws, losses, besthand1, besthand2, besthand3].join(', ')}\n`);
    });
};

module.exports = { getAllGames, getAllPlayers, getGames, getPlayers, setGames, setPlayers, newGames };