import { createServer } from 'http';
import { readFile } from 'fs';
import { extname as _extname } from 'path';
import { Server } from 'socket.io';

import Minesweeper from './minesweeper.js';
import Player from './player.js';

const port = 3000;
const app = createServer(requestHandler).listen(port);
const io = new Server(app);

console.log(`Http server running at localhost:${port}`);

function requestHandler(request, response) {

    let filePath = `./client${request.url}`;
    if (filePath == './client/') filePath += 'index.html';

    const extname = String(_extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                readFile('./404.html', (error, content) => {
                    response.writeHead(404, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            } else {
                response.writeHead(500);
                response.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
            }
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

}

const sockets = {};
// const rooms = {};

// function randomId() {
//     let id = Math.floor(1000 + Math.random() * 9000);
//     if (id in rooms) return randomId();
//     return id;
// }

io.on('connection', (socket) => {

    console.log('Socket.io started...');

    socket.on('connection', () => {
        
        console.log(`Client socket connected (new user): ${socket.id}`);

        // const id = randomId();
        // socket.join(id);
        // rooms[id] = {
        //     id: id,
        //     socketList: [socket],
        // };

        sockets[socket.id] = new Player(socket);

        socket.emit('initialize player', socket.id);

    });

    socket.on('disconnect', () => {
        console.log(`Client socket disconnected: ${socket.id}`);
        io.emit('remove socket', socket.id);
        delete sockets[socket.id];
    });

    socket.on('create game', () => {
        console.log(`Create game: ${socket.id}`);
        sockets[socket.id].game = new Minesweeper(sockets[socket.id], 10, 15);
        sockets[socket.id].game.createTable();
        sockets[socket.id].game.display('initialize game');
    });

    socket.on('click', (click) => {
        console.log(`new click: ${click}`);
        sockets[socket.id].game.registerClick(click);
    });

    socket.on('tell broadcaster-initialize game', (state) => {
        console.log(`tell broadcaster-initialize game`);
        io.to(state.stateId).emit('respond to initialize game', state);
    });

});