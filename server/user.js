import Room from './room.js';

class User {

    constructor(socket) {
        this.socket = socket;
        this.game = null;
        this.room = new Room([this.socket.id]);
    }

}

export default User;