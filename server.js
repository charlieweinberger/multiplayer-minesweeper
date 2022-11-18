import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Minesweeper from './minesweeper.js';

const app = express();
const httpServer = http.Server(app);
const io = new Server(httpServer);

app.use(express.static('client'));
app.get('/', (_, res) => res.sendFile(`${__dirname}/client/index.html`));

let clientSockets = {};

io.on('connection', (socket) => {

    // socketry

    let socketId = socket.id;
    clientSockets[socketId] = socket;

    console.log(`Client socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Client socket disconnected: ${socketId}`);
        delete clientSockets[socketId];
    });

    // game

    let game = new Minesweeper(clientSockets, 10, 15);
    game.initialize();

    socket.on('click', click => game.registerClick(click));

});

httpServer.listen(3000, () => console.log('Listening on *:3000'));