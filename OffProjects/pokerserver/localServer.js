

// This is subject to change with a real server

const input = require('readline-sync');
const databaseCalls = require('./databaseCalls');
const elo = require('./elo');

const promptLoop = () => {
    const command = input.question('> ').toLowerCase().split(/\s+/g);
    switch (command[0]) {
        case 'get':
            switch (command[1]) {
                case 'players':
                    const playersToGet = command.slice(2);
                    if (playersToGet.length === 0)
                        databaseCalls.getAllPlayers().then(console.log);
                    else
                        databaseCalls.getPlayers(playersToGet).then(console.log);
                    break;
                case 'games':
                    const gamesToGet = command.slice(2);
                    if (gamesToGet.length === 0)
                        databaseCalls.getAllGames().then(console.log);
                    else
                        databaseCalls.getGames(gamesToGet).then(console.log);
                    break;
                default:
                    console.log("Unknown command! Try 'help'.");
            }
            break;
        case 'newgame':
            const buyin = command[1] - 0;
            const players = command.slice(2);
            elo.playGame(players, buyin).then(() => console.log("Game Created!")).catch((err) => console.log(err));
            break;
        case 'scoreplayers':
            elo.parseGames().then(() => console.log("Players reset to follow the games within the games file!")).catch((err) => console.log(err));
            break;
        case 'save':
            databaseCalls.save(command[1]).then(() => console.log("Database saved!")).catch((err) => console.log(err));
            break;
        case 'help':
            console.log(`Command reference:
    get players               - List all players.
    get players [players]     - List selected players (separated by spaces).
    get games                 - List all games.
    get games [games]         - List selected games (separated by spaces).
    newgame [buyin] [players] - Create a new game with specified buyin amount and players (separated by spaces).
                                NOTE: [players] should be in losing -> winning order, and include when people went out, even if they bought back in at the time.
                                (i.e. if a player buys back in, their name should be in the list multiple times)
    scoreplayers              - Read from the games file, and re-score all players from the beginning.
    save                      - Save all current changes to the database.
    exit                      - Close the server.`);
            break;
        case 'exit':
            return;
        default:
            console.log("Unknown command! Try 'help'.");
    }
    setTimeout(promptLoop, 1);
};



databaseCalls.readFullDatabase().then(promptLoop);