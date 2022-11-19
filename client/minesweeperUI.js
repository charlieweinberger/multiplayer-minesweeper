let socket = io();

socket.emit('connection');

let boardHTML;
let statusHTML;

socket.on('initialize game', (state) => {
    updateElementsById();
    createBoard(state.board, state.boardSize);
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

function createBoard(board, boardSize) {

    for (let i = 0; i < boardSize; i++) {
        let row = boardHTML.insertRow();
        for (let j = 0; j < boardSize; j++) {
            
            let square = row.insertCell();

            for (let className of board[j][i].classList) {
                square.classList.add(className);
            }

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

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (boardHTML.rows[i].cells[j].innerHTML != '') {

                if (i > 0 && j > 0 && elemInList('hidden', boardHTML.rows[i - 1].cells[j - 1].classList)) {
                    statusHTML.innerHTML = `(i, j): (${i}, ${j})`;
                    // boardHTML.rows[i].cells[j].background = 'linear-gradient(to top, #87af3a 5px, transparent 5px) 100% 100%;';
                }

                // background:
                //      linear-gradient(to bottom, #87af3a 5px, transparent 5px) 0 0,
                //      linear-gradient(to bottom, #87af3a 5px, transparent 5px) 100% 0,
                //      linear-gradient(to top, #87af3a 5px, transparent 5px) 0 100%,
                //      linear-gradient(to top, #87af3a 5px, transparent 5px) 100% 100%;

                if (i > 0 && elemInList('hidden', boardHTML.rows[i - 1].cells[j].classList)) {
                    boardHTML.rows[i].cells[j].style.borderTop = '5px solid #87af3a';
                } else {
                    boardHTML.rows[i].cells[j].style.borderTop = '';
                }

                // if (i > 0 && j < boardSize - 1 && elemInList('hidden', boardHTML.rows[i - 1].cells[j + 1].classList)) {
                //     boardHTML.rows[i].cells[j].style.background += 'linear-gradient(to bottom, #87af3a 5px, transparent 5px) 100% 0;';
                // }

                if (j > 0 && elemInList('hidden', boardHTML.rows[i].cells[j - 1].classList)) {
                    boardHTML.rows[i].cells[j].style.borderLeft = '5px solid #87af3a';
                } else {
                    boardHTML.rows[i].cells[j].style.borderLeft = '';
                }

                if (j < boardSize - 1 && elemInList('hidden', boardHTML.rows[i].cells[j + 1].classList)) {
                    boardHTML.rows[i].cells[j].style.borderRight = '5px solid #87af3a';
                } else {
                    boardHTML.rows[i].cells[j].style.borderRight = '';
                }

                // if (i < boardSize - 1 && j > 0 && elemInList('hidden', boardHTML.rows[i + 1].cells[j - 1].classList)) {
                //     boardHTML.rows[i].cells[j].style.background += 'linear-gradient(to top, #87af3a 5px, transparent 5px) 0 100%;';
                // }

                if (i < boardSize - 1 && elemInList('hidden', boardHTML.rows[i + 1].cells[j].classList)) {
                    boardHTML.rows[i].cells[j].style.borderBottom = '5px solid #87af3a';
                } else {
                    boardHTML.rows[i].cells[j].style.borderBottom = '';
                }

                // if (i < boardSize - 1 && j < boardSize - 1 && elemInList('hidden', boardHTML.rows[i + 1].cells[j + 1].classList)) {
                //     boardHTML.rows[i].cells[j].style.background += 'linear-gradient(to top, #87af3a 5px, transparent 5px) 100% 100%;';
                // }

            }
        }
    }

    if (status == 'game over') {
        statusHTML.innerHTML = youWin ? 'You Win!' : 'You Lose!';
    }

}

function getSurroundingCoords(x, y, boardSize) {

    let allPossibleCoords = [
        [x-1, y-1], [x-1, y], [x-1, y+1], 
        [x,   y-1], [x,   y], [x,   y+1], 
        [x+1, y-1], [x+1, y], [x+1, y+1]
    ];

    return allPossibleCoords.filter(c => 0 <= c[0] && c[0] <= boardSize - 1 && 0 <= c[1] && c[1] <= boardSize - 1);

}

function elemInList(elem, list) {
    for (let listElem of list) {
        if (elem === listElem) {
            return true;
        }
    }
    return false;
}