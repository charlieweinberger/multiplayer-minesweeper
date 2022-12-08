class Room {

    constructor(code) {
        this.sockets = [];
        this.code = code;
    }

    startCompetition() {
        // work on this
    }

    toEmit() {
        return {
            sockets: this.sockets.map(socket => socket.id),
            code: this.code,
        };
    }

    socketInRoom(socket) {

        for (let thisSocket of this.sockets) {
            if (thisSocket.id == socket.id) {
                return true;
            }
        }

        return false;

    }

    removeSocket(socket) {
        for (let i = 0; i < this.sockets.length; i++) {
            if (this.sockets[i].id == socket.id) {
                this.sockets.splice(i, 1);
                return;
            }
        }
    }

}

export default Room;