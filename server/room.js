class Room {

    constructor(socketIdList, code=this.generateRoomCode()) {
        this.socketIdList = socketIdList;
        this.code = code;
    }

    generateRoomCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    startCompetition() {
        // work on this
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