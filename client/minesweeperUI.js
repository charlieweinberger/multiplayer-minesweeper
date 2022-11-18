let socket = io();

socket.emit('connection');

let boardHTML;
let statusHTML;

socket.on('initialize game', (state) => {
    updateElementsById();
    createBoard(state.boardSize);
    createEventListeners();
});

socket.on('update game', (state) => {
    updateElementsById();
    updateUI(state.board, state.boardSize, state.status, state.youWin);
});

function updateElementsById() {
    boardHTML  = document.getElementById("board");
    statusHTML = document.getElementById("status");
}

function createBoard(boardSize) {
    for (let i = 0; i < boardSize; i++) {
        let row = boardHTML.insertRow();
        for (let j = 0; j < boardSize; j++) {
            let square = row.insertCell();
            square.className = 'square';
        }
    }
}

function createEventListeners() {

    boardHTML.addEventListener('click', e => {

        let x = e.target.parentElement.rowIndex;
        let y = e.target.cellIndex;

        if (x !== undefined && y !== undefined) {
            socket.emit('click', {
                x: e.target.parentElement.rowIndex,
                y: e.target.cellIndex,
                type: 'left'
            });
        }

    });

    boardHTML.addEventListener('contextmenu', e => {
        
        e.preventDefault();

        let x = e.target.parentElement.rowIndex;
        let y = e.target.cellIndex;

        if (x !== undefined && y !== undefined) {
            socket.emit('click', {
                x: e.target.parentElement.rowIndex,
                y: e.target.cellIndex,
                type: 'right'
            });
        }

    });

}

function updateUI(board, boardSize, status, youWin) {
    
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {

            boardHTML.rows[i].cells[j].innerHTML = board[j][i].innerHTML;

            boardHTML.rows[i].cells[j].removeAttribute("class");
            for (let className of board[j][i].classList) {
                boardHTML.rows[i].cells[j].classList.add(className);
            }

        }
    }

    if (status == 'game over') {
        statusHTML.innerHTML = youWin ? 'You Win!' : 'You Lose!';
    }

}