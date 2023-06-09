const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const databaseCalls = require('./databaseCalls');
const app = express();

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    res.header({
        'Access-Control-Allow-Origin': "*",
        'Access-Control-Allow-Credentials': true,
    });
    next();
})


let chats = [];

app.post('/clockin', async(req, res) => {});

app.get('/', async(req, res) => {
    const page = req.query.page || 1;
    res.send({
        chats: chats.length >= page * PAGESIZE ? chats.slice(chats.length - page * PAGESIZE) : chats,
        page: Math.min(page, Math.ceil(chats.length / PAGESIZE))
    });

    chats = (await databaseCalls.allChats()).sort((a, b) => a.time - b.time);
});

// const port = 8192
// app.listen(port, () => {
//     console.log("Server listening on port: " + port);
// });

module.exports.handler = serverless(app);