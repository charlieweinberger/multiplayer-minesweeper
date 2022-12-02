import { createServer } from 'http';
import { readFile } from 'fs';
import { extname as _extname } from 'path';
import { Server } from 'socket.io';

import User from './user.js';

const port = 3000;
const app = createServer(requestHandler).listen(port);
const io = new Server(app);

console.log(`Http server running at localhost:${port}\n`);

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

const users = {};
const rooms = {};

function generateRoomCode() {
    let code = Math.floor(1000 + Math.random() * 9000).toString();
    if (code in rooms) return generateRoomCode();
    return code;
}

io.on('connection', (socket) => {

    console.log('Socket.io started...');

    socket.on('connection', () => {
        console.log(`Socket connected: ${socket.id}`);
        const code = generateRoomCode(); // create room code
        const user = new User(socket.id, code); // create user
        users[socket.id] = user; // add user to user list
        socket.emit('new room', code);
    });

    socket.on('new room', (code) => {

        removeFromRooms(socket, true); // leave room(s)

        // join room

        socket.join(code); // join room
        users[socket.id].code = code; // update room code in user class

        if (Object.hasOwn(rooms, code)) {
            rooms[code].socketIdList.push(socket.id); // if the room exists in the room list, update the socket list
        } else {
            rooms[code] = { code: code, socketIdList: [socket.id] }; // if the room doesn't exist in the room list, creat the room
        }

        // update UI

        socket.emit('update socket', {
            socketId: socket.id,
            user: users[socket.id],
            room: rooms[code]
        });

        socket.in(code).emit('update other sockets', {
            socketId: socket.id,
            user: users[socket.id],
            room: rooms[code]
        });

        printUserAndRoomInfo(); // print to console

    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        delete users[socket.id]; // remove socket from users
        removeFromRooms(socket, false); // remove socket from rooms
    });

});

function removeFromRooms(socket, leaveRoom) {
    for (let roomCode of Object.keys(rooms)) { // loop through all rooms
        if (rooms[roomCode].socketIdList.includes(socket.id)) { // if socket is in a room
            if (leaveRoom) socket.leave(roomCode); // leave room
            const index = rooms[roomCode].socketIdList.indexOf(socket.id);
            rooms[roomCode].socketIdList.splice(index, 1); // remove old room from socket list
            if (rooms[roomCode].socketIdList.length === 0) delete rooms[roomCode]; // remove room from rooms if there are no sockets
        }
    }
}

function printUserAndRoomInfo() {
    console.log(`\nusers and rooms:`);
    console.log(Object.values(users));
    console.log(Object.values(rooms));
}