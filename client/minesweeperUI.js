let socket = io();
socket.emit('connection');

createEventListeners();

// socketry

socket.on('new room', (code) => socket.emit('new room', code));

socket.on('update socket', (socketInfo) => {

    console.log(`update socket ${socket.id} in room ${socketInfo.room.code}`);
    document.getElementById("roomCode").innerHTML = `Code: ${socketInfo.room.code}`;
    
    const clientsInRoomHTML = document.getElementById("clientsInRoom");
    clientsInRoomHTML.innerHTML = 'Clients: ';
    for (const socketId of socketInfo.room.socketIdList) {
        const isThisYou = (socket.id === socketInfo.socketId) ? ' (you)' : '';
        clientsInRoomHTML.innerHTML += `${socketId}${isThisYou}, `;
    }

    document.getElementById("leaveRoom").addEventListener('click', () => socket.emit('new room', socketInfo.room.code));
    
});

socket.on('update other sockets', (socketInfo) => {
    
    console.log(`update socket ${socketInfo.socketId} in socket ${socket.id} in room ${socketInfo.room.code}`);
    document.getElementById("roomCode").innerHTML = `Code: ${socketInfo.room.code}`;

    const clientsInRoomHTML = document.getElementById("clientsInRoom");
    clientsInRoomHTML.innerHTML = 'Clients: ';
    for (const socketId of socketInfo.room.socketIdList) {
        const isThisYou = (socket.id === socketInfo.socketId) ? ' (not you)' : '';
        clientsInRoomHTML.innerHTML += `${socketId}${isThisYou}, `;
    }
    
    document.getElementById("leaveRoom").addEventListener('click', () => socket.emit('new room', socketInfo.room.code));

});

function createEventListeners() {

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

}