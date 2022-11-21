let socket = io();

socket.emit('connection');

// socketry

socket.on('initialize game', (state) => {
    console.log('initialize game');
    table = createGame(state.id, state.board, state.boardSize);
    createEventListeners(table);
});

socket.on('broadcast-initialize game', (state) => {

    console.log('broadcast-initialize game');

    createGame(state.id, state.board, state.boardSize);

    let tableToEmit = getTableById(socket.id);
    let tableToReallyEmit = [];
    let tableToReallyReallyEmit = [];

    for (let i = 0; i < state.boardSize; i++) {
        tableToReallyEmit.push([]);
        for (let j = 0; j < state.boardSize; j++) {
            tableToReallyEmit.push([]);
        }
    }

    for (let i = 0; i < state.boardSize; i++) {
        for (let j = 0; j < state.boardSize; j++) {
            tableToReallyEmit[i][j] = {
                innerHTML: tableToEmit.rows[i].cells[j].innerHTML,
                className: tableToEmit.rows[i].cells[j].className
            }
        }
    }

    for (let i = 0; i < state.boardSize; i++) {
        if (tableToReallyEmit[i] != []) {
            tableToReallyReallyEmit.push(tableToReallyEmit[i]);
        }
    }

    socket.emit('tell broadcaster-initialize game', {
        stateId: state.id,
        socketId: socket.id,
        boardSize: state.boardSize,
        tableToReallyReallyEmit: tableToReallyReallyEmit
    });

});

socket.on('respond to initialize game', (state) => {
    console.log('respond to initialize game');
    createGame(state.socketId, state.tableToReallyReallyEmit, state.boardSize, true);
});

socket.on('update game', (state) => {
    console.log('update game');
    updateUI(getTableById(state.id), state.board, state.boardSize, state.status, state.youWin);
});

socket.on('broadcast-update game', (state) => {
    console.log('broadcast-update game');
    updateUI(getTableById(state.id), state.board, state.boardSize, state.status, state.youWin);
});

// socket.on('remove socket', (state) => {
//     console.log('remove socket');
// });

// socket.on('broadcast-remove socket', (state) => {
//     console.log('broadcast-remove socket');
// });

// helper functions

function getTableById(id) {
    for (let table of document.getElementsByClassName("table")) {
        if (table.id == `table-${id}`) {
            return table;
        }
    }
}

function createGame(id, board, boardSize, filled=false) {

    // create divs

    const column = document.createElement("div");
    column.setAttribute('class', 'column');
    column.setAttribute('id', `column-${id}`);
    column.innerHTML = id;

    const boardDiv = document.createElement("div");
    boardDiv.setAttribute('class', 'boardDiv');
    boardDiv.setAttribute('id', `boardDiv-${id}`);

    const table = document.createElement("table");
    table.setAttribute('class', 'table');
    table.setAttribute('id', `table-${id}`);
    table.setAttribute('cellspacing', '0');
    table.setAttribute('cellpadding', '0');

    // create table

    for (let i = 0; i < boardSize; i++) {
        let row = table.insertRow();
        for (let j = 0; j < boardSize; j++) {
            
            let square = row.insertCell();

            if (filled) {
                square.innerHTML = board[i][j].innerHTML;
                square.className = board[i][j].className;
            } else {
                for (let className of board[j][i].classList) {
                    square.classList.add(className);
                }
            }

        }
    }

    // add divs

    boardDiv.appendChild(table);
    column.appendChild(boardDiv);
    document.getElementById("row").appendChild(column);
    
    return table;

}

function createEventListeners(table) {

    table.addEventListener('click', e => {

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

    table.addEventListener('contextmenu', e => {
        
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

// update game

function updateUI(boardHTML, board, boardSize, status, youWin) {
    
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {

            let colorMap = {
                1: '#1976d2',
                2: '#3b8f3e',
                3: '#d33030',
                4: '#7b1fa2',
                5: '#ff8f00',
                6: 'teal',
                7: 'black',
                8: '#d3d3d3'
            };

            boardHTML.rows[i].cells[j].innerHTML = `<b>${board[j][i].innerHTML}</b>`;
            boardHTML.rows[i].cells[j].style.color = colorMap[board[j][i].innerHTML];

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

                // // top left border

                // if (topLeftHidden && !topHidden && !leftHidden) {

                //     let div = document.createElement("div");
                //     div.className = 'cornerBorder';
                    
                //     div.style.width = BORDER_WIDTH;
                //     div.style.height = BORDER_WIDTH;
                //     div.style.background = BORDER_COLOR;

                //     div.style.position = 'relative';
                //     div.style.top = '-32px';
                //     div.style.left = '0px';

                //     boardHTML.rows[i].cells[j].appendChild(div);

                // }

                // // top right border

                // if (topRightHidden && !topHidden && !rightHidden) {

                //     let div = document.createElement("div");
                //     div.className = 'cornerBorder';
                    
                //     div.style.width = BORDER_WIDTH;
                //     div.style.height = BORDER_WIDTH;
                //     div.style.background = BORDER_COLOR;

                //     div.style.position = 'relative';
                //     div.style.top = '-32px';
                //     div.style.left = '45px';

                //     boardHTML.rows[i].cells[j].appendChild(div);

                // }

                // // bottom left border

                // if (bottomLeftHidden && !bottomHidden && !leftHidden) {

                //     let div = document.createElement("div");
                //     div.className = 'cornerBorder';
                    
                //     div.style.width = BORDER_WIDTH;
                //     div.style.height = BORDER_WIDTH;
                //     div.style.background = BORDER_COLOR;

                //     div.style.position = 'relative';
                //     div.style.top = '13px';
                //     div.style.left = '0px';

                //     boardHTML.rows[i].cells[j].appendChild(div);

                // }

                // // bottom right border

                // if (bottomRightHidden && !bottomHidden && !rightHidden) {

                //     let div = document.createElement("div");
                //     div.className = 'cornerBorder';
                    
                //     div.style.width = BORDER_WIDTH;
                //     div.style.height = BORDER_WIDTH;
                //     div.style.background = BORDER_COLOR;

                //     div.style.position = 'relative';
                //     div.style.top = '13px';
                //     div.style.left = '45px';

                //     boardHTML.rows[i].cells[j].appendChild(div);

                // }
                
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