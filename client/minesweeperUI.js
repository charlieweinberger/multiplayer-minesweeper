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

    // instead of checking for 'hidden', check for something else, so that mines being revealed don't remove the borders

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {

            if (board[j][i].innerHTML != '') {

                const BORDER_WIDTH = '5px';
                const BORDER_COLOR = '#87af3a';

                let topHidden, bottomHidden, leftHidden, rightHidden, topLeftHidden, topRightHidden, bottomLeftHidden, bottomRightHidden;

                if (i > 0)             topHidden    = elemInList('hidden', boardHTML.rows[i - 1].cells[j].classList);
                if (i < boardSize - 1) bottomHidden = elemInList('hidden', boardHTML.rows[i + 1].cells[j].classList);
                if (j > 0)             leftHidden   = elemInList('hidden', boardHTML.rows[i].cells[j - 1].classList);
                if (j < boardSize - 1) rightHidden  = elemInList('hidden', boardHTML.rows[i].cells[j + 1].classList);

                if (i > 0 && j > 0)                         topLeftHidden     = elemInList('hidden', boardHTML.rows[i - 1].cells[j - 1].classList);
                if (i > 0 && j < boardSize - 1)             topRightHidden    = elemInList('hidden', boardHTML.rows[i - 1].cells[j + 1].classList);
                if (i < boardSize - 1 && j > 0)             bottomLeftHidden  = elemInList('hidden', boardHTML.rows[i + 1].cells[j - 1].classList);
                if (i < boardSize - 1 && j < boardSize - 1) bottomRightHidden = elemInList('hidden', boardHTML.rows[i + 1].cells[j + 1].classList);

                // side borders

                const border = `${BORDER_WIDTH} solid ${BORDER_COLOR}`;
                
                boardHTML.rows[i].cells[j].style.borderTop    = (topHidden)    ? border : '';
                boardHTML.rows[i].cells[j].style.borderBottom = (bottomHidden) ? border : '';
                boardHTML.rows[i].cells[j].style.borderLeft   = (leftHidden)   ? border : '';
                boardHTML.rows[i].cells[j].style.borderRight  = (rightHidden)  ? border : '';

                // top left border

                if (topLeftHidden && !topHidden && !leftHidden) {

                    let div = document.createElement("div");
                    div.className = 'cornerBorder';
                    
                    div.style.width = BORDER_WIDTH;
                    div.style.height = BORDER_WIDTH;
                    div.style.background = BORDER_COLOR;

                    div.style.position = 'relative';
                    div.style.top = '-32px';
                    div.style.left = '0px';

                    boardHTML.rows[i].cells[j].appendChild(div);

                }

                // top right border

                if (topRightHidden && !topHidden && !rightHidden) {

                    let div = document.createElement("div");
                    div.className = 'cornerBorder';
                    
                    div.style.width = BORDER_WIDTH;
                    div.style.height = BORDER_WIDTH;
                    div.style.background = BORDER_COLOR;

                    div.style.position = 'relative';
                    div.style.top = '-32px';
                    div.style.left = '45px';

                    boardHTML.rows[i].cells[j].appendChild(div);

                }

                // bottom left border

                if (bottomLeftHidden && !bottomHidden && !leftHidden) {

                    let div = document.createElement("div");
                    div.className = 'cornerBorder';
                    
                    div.style.width = BORDER_WIDTH;
                    div.style.height = BORDER_WIDTH;
                    div.style.background = BORDER_COLOR;

                    div.style.position = 'relative';
                    div.style.top = '13px';
                    div.style.left = '0px';

                    boardHTML.rows[i].cells[j].appendChild(div);

                }

                // bottom right border

                if (bottomRightHidden && !bottomHidden && !rightHidden) {

                    let div = document.createElement("div");
                    div.className = 'cornerBorder';
                    
                    div.style.width = BORDER_WIDTH;
                    div.style.height = BORDER_WIDTH;
                    div.style.background = BORDER_COLOR;

                    div.style.position = 'relative';
                    div.style.top = '13px';
                    div.style.left = '45px';

                    boardHTML.rows[i].cells[j].appendChild(div);

                }
                
            }
            
            // else {
            //     boardHTML.rows[i].cells[j].style.border = '';
            //     for (const cornerBorder of document.getElementsByClassName('cornerBorder')) {
            //         cornerBorder.style.visibility = 'hidden';
            //     }
            // }

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