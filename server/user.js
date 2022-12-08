class User {

    constructor(socket) {
        this.socket = socket;
        this.code = this.generateRoomCode();
        this.game = null;
    }

    generateRoomCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

}

export default User;