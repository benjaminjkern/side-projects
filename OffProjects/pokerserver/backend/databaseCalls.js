// This is subject to change with a real server

const parseTable = (tableFile) => {
    if (fs.existsSync(tableFile))
        return fs
            .readFileSync(tableFile, "utf8")
            .split(/\r?\n/g)
            .filter((line) => line[0] !== "#");
    return [];
};

const GAMES_FILE = "backend/games.csv";
const PLAYERS_FILE = "backend/players.csv";

const fs = require("fs");

const setPlayers = async (players) => {
    const allPlayers = await getAllPlayers();
    Object.keys(players).forEach(
        (playerName) => (allPlayers[playerName] = players[playerName])
    );
    await savePlayers(allPlayers);
};

const newGames = async (games) => {
    const allGames = await getAllGames();
    games.forEach((game) =>
        allGames.push({ gameNum: ALL_GAMES.length, ...game })
    );
    await saveGames(allGames);
};

const getAllPlayers = async () => {
    return parseTable(PLAYERS_FILE).reduce((players, player, i) => {
        const [
            name,
            profit,
            score,
            games,
            wins,
            draws,
            losses,
            besthand1,
            besthand2,
            besthand3,
        ] = player.split(/\s*,\s*/g);
        if (name.length === 0) return players;
        return {
            ...players,
            [name.toLowerCase()]: {
                name,
                profit: profit - 0 || 0,
                score: score - 0 || 0,
                games: games - 0 || 0,
                wins: wins - 0 || 0,
                draws: draws - 0 || 0,
                losses: losses - 0 || 0,
                besthand1: besthand1 || "",
                besthand2: besthand2 || "",
                besthand3: besthand3 || "",
            },
        };
    }, {});
};

const savePlayers = async (players) => {
    fs.writeFileSync(PLAYERS_FILE, "");
    Object.keys(players).forEach((player) => {
        const {
            name,
            profit,
            score,
            games,
            wins,
            draws,
            losses,
            besthand1,
            besthand2,
            besthand3,
        } = players[player];
        fs.appendFileSync(
            PLAYERS_FILE,
            `${[
                name,
                profit,
                score,
                games,
                wins,
                draws,
                losses,
                besthand1,
                besthand2,
                besthand3,
            ].join(",")}\n`
        );
    });
};

const getAllGames = async () => {
    return parseTable(GAMES_FILE)
        .map((game, gameNum) => {
            const [players, buyin] = game.split(/\s*;\s*/g);
            if (players.length === 0) return;
            return {
                gameNum,
                players: players
                    .split(/\s*,\s*/g)
                    .map((player) => player.toLowerCase()),
                buyin: buyin - 0,
            };
        })
        .filter((a) => a);
};

const saveGames = async (games) => {
    fs.writeFileSync(GAMES_FILE, "");
    games.forEach((game) => {
        const { players, buyin } = game;
        fs.appendFileSync(GAMES_FILE, `${players.join(",")};${buyin}\n`);
    });
};

module.exports = {
    getAllGames,
    getAllPlayers,
    setPlayers,
    newGames,
    savePlayers,
    saveGames,
};
