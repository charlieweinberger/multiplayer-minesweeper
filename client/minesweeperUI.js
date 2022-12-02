let socket = io();
socket.emit('connection');

// socketry

socket.on('new room', (code) => socket.emit('new room', code));

socket.on('update UI', (info) => {

    const code = info.room.code;

    console.log(`update socket ${socket.id} in room ${code}`);

    document.getElementById("roomCode").innerHTML = `Code: ${code}`;

    const clientsInRoomHTML = document.getElementById("clientsInRoom");
    clientsInRoomHTML.innerHTML = 'Clients: ';
    for (const socketId of info.room.socketIdList) {
        clientsInRoomHTML.innerHTML += `${socketId}, `;
    }

    document.getElementById("leaveRoom").addEventListener('click', () => socket.emit('new room', code));

});

// event listeners

document.getElementById("inputForm").addEventListener('submit', (e) => {

    const inputTextHTML = document.getElementById("inputText");
    console.log(inputTextHTML.value);
    e.preventDefault();

    if (inputTextHTML.value !== '') {
        socket.emit('new room', inputTextHTML.value);
        inputTextHTML.value = '';
        errorText.innerHTML = '';
    } else {
        errorText.innerHTML = 'You must input something!';
    }

});