import { createServer } from 'http';
import { readFile } from 'fs';
import { extname as _extname } from 'path';
import { Server } from 'socket.io';

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

const rooms = {};

function randomCode() {
    let code = Math.floor(1000 + Math.random() * 9000).toString();
    if (code in rooms) return randomCode();
    return code;
}

io.on('connection', (socket) => {

    console.log('Socket.io started...');

    socket.on('connection', () => {
        
        console.log(`Client socket connected: ${socket.id}`);
       
        const code = randomCode();
        socket.join(code);
        rooms[code] = { code: code, socketIdList: [socket.id] };
        
        console.log(`create room: ${code}`);

        io.to(code).emit('update UI', rooms[code]);
    
    });

    socket.on('join room', (code) => {
        console.log(`join room: ${code}`);
        socket.join(code);
        rooms[code].socketIdList.push(socket.id);
        io.to(code).emit('update UI', rooms[code]);
    });

    socket.on('leave room', (code) => {
        console.log(`leave room: ${code}`);
        socket.join(code);
        rooms[code].socketIdList.push(socket.id);
        io.to(code).emit('update UI', rooms[code]);
    });

});