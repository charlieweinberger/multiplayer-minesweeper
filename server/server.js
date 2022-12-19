import { createServer } from 'http';
import { readFile } from 'fs';
import { extname as _extname } from 'path';
import { Server } from 'socket.io';

import Room from './room.js';
import User from './user.js';
import Minesweeper from './minesweeper.js';

const port = 3000;
const app = createServer(requestHandler).listen(port);
const io = new Server(app);

console.log(`Http server running at localhost:${port}\n`);

function requestHandler(req, res) {

    let filePath = `./client${req.url}`;
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
                    res.writeHead(404, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

}

const rooms = {};
const users = {};

io.on('connection', (socket) => {

    console.log('Socket.io started...');

    socket.on('connection', () => {

        console.log(`Socket connected: ${socket.id}`);

        const user = new User(socket);

        users[socket.id] = user;
        rooms[user.room.code] = user.room;

        socket.emit('join room', user.room.code); // create room
        socket.emit('initialize user', socket.id); // create user in room

    });

    socket.on('request to join room', (code) => {
        if (rooms[code].socketIdList.includes(socket.id)) {
            socket.emit('error in joining room', `You are already in room ${code}!`);
        } else if (rooms[code].socketIdList.length === 4) {
            socket.emit('error in joining room', `Room ${code} is full.`);
        } else {
            socket.emit('join room', code);
        }
    });

    socket.on('join room', (code) => {

        removeFromRooms(socket); // leave room(s)

        // join room

        socket.join(code);

        if (!Object.hasOwn(rooms, code)) {
            const room = new Room([socket.id], code); // create the room if the room doesn't exist
            rooms[code] = room; // update room in rooms list
            users[socket.id].room = room; // update room in user
        } else {
            rooms[code].addSocket(socket.id); // update the socket list
        }

        // update UI        

        io.in(code).emit('join room for this socket', {
            socketId: socket.id,
            room: rooms[code]
        });

        socket.to(code).emit('broadcast-initialize user', socket.id); // create this socket's user in other sockets in the new room

        printServerInfo();

    });

    socket.on('disconnect', () => {

        console.log(`Socket disconnected: ${socket.id}`);

        if (Object.keys(users).includes(socket.id)) {
            socket.to(users[socket.id].room.code).emit('remove socket', socket.id); // remove UI from other sockets in room
        }

        delete users[socket.id]; // remove socket from users
        removeFromRooms(socket); // remove socket from rooms

    });

    socket.on('create game', () => {
        console.log(`Create game: ${socket.id}`);
        const user = users[socket.id];
        user.game = new Minesweeper(user, 10, 15);
        user.game.createTable();
        user.game.display('initialize game');
    });

    socket.on('click', (click) => {
        console.log(`new click: ${click}`);
        users[socket.id].game.registerClick(click);
    });

    socket.on('tell broadcasters-initialize user', (state) => {
        console.log(`tell broadcasters-initialize user`);
        io.to(state.id).emit('respond to initialize user', state);
        // socket.to("room1").emit('respond to initialize user', state);
    });

    socket.on('tell broadcasters-initialize game', (state) => {
        console.log(`tell broadcasters-initialize game`);
        io.to(state.stateId).emit('respond to initialize game', state);
        // socket.to("room1").emit('respond to initialize game', state);
    });

});

function removeFromRooms(socket) {

    for (let roomCode of Object.keys(rooms)) { // loop through all rooms
        const room = rooms[roomCode];
        if (room.checkForSocket(socket.id)) { // if socket is in a room
        
            socket.leave(roomCode); // leave room
            room.removeSocket(socket.id); // remove old room from socket list
            
            if (room.socketIdList.length === 0) {
                delete rooms[roomCode]; // remove room from rooms if there are no sockets
            }

        }
    }

}

function printServerInfo() {
    console.log(`\nusers and rooms:`);
    console.log(Object.values(users));
    console.log(Object.values(rooms));
}