let socket = io();

createEventListeners();

socket.emit('connection');

socket.on('update UI', (room) => {

    document.getElementById("roomCode").innerHTML = `Code: ${room.code}`;

    const clientsInRoomHTML = document.getElementById("clientsInRoom");
    clientsInRoomHTML.innerHTML = 'Clients: ';
    for (const socketId of room.socketIdList) {
        clientsInRoomHTML.innerHTML += `${socketId}, `;
    }

});

function createEventListeners() {
    
    const inputTextHTML = document.getElementById("inputText");
    const inputFormHTML = document.getElementById("inputForm");

    inputFormHTML.addEventListener('submit', (e) => {

        console.log(inputTextHTML.value);

        e.preventDefault();

        if (inputTextHTML.value !== '') {
            socket.emit('join room', inputTextHTML.value);
            inputTextHTML.value = '';
            errorText.innerHTML = '';
        } else {
            errorText.innerHTML = 'You must input something!';
        }

    });

}