class Room {

    constructor(socketIdList, code = undefined) {
        this.socketIdList = socketIdList;
        this.code = this.generateRoomCode(code);
    }

    generateRoomCode(code) {
        // Fix problem that two rooms could randomly have the same code. Solution is to input other room codes and exclude them.
        let roomCode = Math.floor(1000 + Math.random() * 9000).toString();
        return code ? code : roomCode;
    }

    addSocket(socketId) {
        if (!this.socketIdList.includes(socketId)) {
            this.socketIdList.push(socketId);
        }
    }

    removeSocket(socketId) {
        for (let i = 0; i < this.socketIdList.length; i++) {
            if (this.socketIdList[i] == socketId) {
                this.socketIdList.splice(i, 1);
                return;
            }
        }
    }

    checkForSocket(socketId) {
        for (let socketIdElem of this.socketIdList) {
            if (socketIdElem == socketId) {
                return true;
            }
        }
        return false;
    }

}

export default Room;