const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const elo = require("./backend/elo.js");
const { getAllPlayers } = require("./backend/databaseCalls.js");

// frontend
app.use(express.static("frontend/public"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/index.html"));
});

// backend
app.get("/player", async (req, res) => {
    res.send({ players: await getAllPlayers() });
});

app.get("/game", (req, res) => {
    res.send({ games: [{ order: ["Ben", "Wally", "Ben"] }] });
});

app.post("/game", (req, res) => {
    const newGame = { order: req.body.order };
    databaseCalls.newGame(newGame).then(() => res.send(newGame));
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
