class User {

    constructor(socket, code) {
        this.socket = socket;
        this.code = code;
        this.game = null;
    }

}

export default User;