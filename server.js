import { createServer } from 'http';
import { readFile } from 'fs';
import { extname as _extname } from 'path';
import { Server } from 'socket.io';
import Minesweeper from './minesweeper.js';

const app = createServer(requestHandler).listen(3000);
const io = new Server(app);

console.log('HTTP Server running at localhost:3000');

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

const clientSockets = {};

io.on('connection', (socket) => {

    console.log('Socket.io started...');

    socket.on('connection', () => {
        
        console.log(`Client socket connected: ${socket.id}`);
        
        let game = new Minesweeper(clientSockets, socket.id, 10, 15);
        
        clientSockets[socket.id] = {
            socket: socket,
            game: game
        };

        game.initialize();

    });

    socket.on('disconnect', () => {
        console.log(`Client socket disconnected: ${socket.id}`);
        delete clientSockets[socket.id];
    });

    socket.on('click', (click) => {
        console.log(`new click: ${click}`);
        clientSockets[socket.id].game.registerClick(click);
    });

});