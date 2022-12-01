let socket = io();

socket.emit('connection');

socket.on('initialize player', (id) => {

    console.log(`initialize player: ${id}`);
    createPlayer(id);

    document.getElementById(`createGameButton-${id}`).addEventListener('click', event => {
        socket.emit('create game');
    });

});

socket.on('initialize game', (state) => {
    console.log(`initialize game: ${state.id}`);
    document.getElementById("status").innerHTML += `initialize game: ${state.id} <br>`;
    removeButton(state.id);
    table = createGame(state.id, state);
    createEventListeners(table);
});

socket.on('broadcast-initialize game', (state) => {

    console.log(`broadcast-initialize game: ${state.id}`);
    createGame(state.id, state);

    let table = [];
    for (let i = 0; i < state.tableSize; i++) {
        table.push([]);
        for (let j = 0; j < state.tableSize; j++) {
            table[i].push({
                innerHTML: getTableById(socket.id).rows[i].cells[j].innerHTML,
                className: getTableById(socket.id).rows[i].cells[j].className
            });
        }
    }

    socket.emit('tell broadcaster-initialize game', {
        stateId: state.id,
        socketId: socket.id,
        table: table,
        tableSize: state.tableSize
    });

});

socket.on('respond to initialize game', (state) => {
    console.log(`respond to initialize game: ${state.socketId}`);
    table = createGame(state.socketId, state);
    updateUI(table, state);
});

socket.on('update game', (state) => {
    console.log(`update game: ${state.id}`);
    updateUI(getTableById(state.id), state);
});

socket.on('broadcast-update game', (state) => {
    console.log(`broadcast-update game: ${state.id}`);
    updateUI(getTableById(state.id), state);
});

socket.on('remove socket', (id) => {
    console.log(`remove socket: ${id}`);
    const element = document.getElementById(`column-${id}`);
    element.remove();
});

// helper functions

function getTableById(id) {
    for (let table of document.getElementsByClassName("table")) {
        if (table.id == `table-${id}`) {
            return table;
        }
    }
}

function createPlayer(id) {

    const column = document.createElement("div");
    column.setAttribute('class', 'column');
    column.setAttribute('id', `column-${id}`);
    column.innerHTML = id;

    const boardDiv = document.createElement("div");
    boardDiv.setAttribute('class', 'boardDiv');
    boardDiv.setAttribute('id', `boardDiv-${id}`);

    const button = document.createElement("Button");
    column.setAttribute('id', `createGameButton-${id}`);
    button.innerHTML = "Create game";

    boardDiv.appendChild(button);
    column.appendChild(boardDiv);
    document.getElementById("row").appendChild(column);
    
}

function removeButton(id) {
    // const button = document.getElementById(`createGameButton-${id}`);
    // button.remove();
    document.getElementById('status').innerHTML += 'remove button <br>';
    const boardDiv = document.getElementById(`boardDiv-${id}`);
    const button = document.getElementById(`createGameButton-${id}`);
    boardDiv.removeChild(button);
    document.getElementById('status').innerHTML += 'button has been removed<br>';

}

function createGame(id, state) {

    const table = document.createElement("table");
    table.setAttribute('class', 'table');
    table.setAttribute('id', `table-${id}`);
    table.setAttribute('cellspacing', '0');
    table.setAttribute('cellpadding', '0');

    for (let i = 0; i < state.tableSize; i++) {
        let row = table.insertRow();
        for (let j = 0; j < state.tableSize; j++) {
            let square = row.insertCell();
            square.className = state.table[i][j].className;
            square.innerHTML = state.table[i][j].innerHTML;
        }
    }

    document.getElementById(`boardDiv-${id}`).appendChild(table);
    return table;

}

function createEventListeners(table) {

    table.addEventListener('mousedown', event => {

        let x = event.target.parentElement.rowIndex;
        let y = event.target.cellIndex;

        let clickTypeMap = {
            1: 'left',
            2: 'middle',
            3: 'right'
        }

        if (x !== undefined && y !== undefined && (event.which == 1 || event.which == 3)) {
            socket.emit('click', {
                x: x,
                y: y,
                type: clickTypeMap[event.which]
            });
        }

    });

    table.addEventListener('contextmenu', event => event.preventDefault());

}

// update game

function updateUI(table, state) {
    
    for (let i = 0; i < state.tableSize; i++) {
        for (let j = 0; j < state.tableSize; j++) {

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

            table.rows[i].cells[j].innerHTML = state.table[i][j].innerHTML;
            table.rows[i].cells[j].className = state.table[i][j].className;
            table.rows[i].cells[j].style.color = colorMap[state.table[i][j].innerHTML];

        }
    }

    for (let i = 0; i < state.tableSize; i++) {
        for (let j = 0; j < state.tableSize; j++) {
            if (state.table[i][j].innerHTML != '') {

                // side borders

                let topHidden, bottomHidden, leftHidden, rightHidden;

                if (i > 0)                   topHidden    = cellIsHidden(table, i-1, j);
                if (i < state.tableSize - 1) bottomHidden = cellIsHidden(table, i+1, j);
                if (j > 0)                   leftHidden   = cellIsHidden(table, i, j-1);
                if (j < state.tableSize - 1) rightHidden  = cellIsHidden(table, i, j+1);

                const border = '5px solid #87af3a';

                table.rows[i].cells[j].style.border = '';

                if (topHidden)    table.rows[i].cells[j].style.borderTop    = border;
                if (bottomHidden) table.rows[i].cells[j].style.borderBottom = border;
                if (leftHidden)   table.rows[i].cells[j].style.borderLeft   = border;
                if (rightHidden)  table.rows[i].cells[j].style.borderRight  = border;

                // corner borders

                // let topLeftHidden, topRightHidden, bottomLeftHidden, bottomRightHidden;

                // if (i > 0 && j > 0)                                     topLeftHidden     = cellIsHidden(table, i-1, j-1);
                // if (i > 0 && j < state.tableSize - 1)                   topRightHidden    = cellIsHidden(table, i-1, j+1);
                // if (i < state.tableSize - 1 && j > 0)                   bottomLeftHidden  = cellIsHidden(table, i+1, j-1);
                // if (i < state.tableSize - 1 && j < state.tableSize - 1) bottomRightHidden = cellIsHidden(table, i+1, j+1);

                // if (topLeftHidden     && !topHidden    && !leftHidden)  addCornerBorderDiv(table, i, j, '-2px', '0px');
                // if (topRightHidden    && !topHidden    && !rightHidden) addCornerBorderDiv(table, i, j, '-2px', '45px');
                // if (bottomLeftHidden  && !bottomHidden && !leftHidden)  addCornerBorderDiv(table, i, j, '43px', '0px');
                // if (bottomRightHidden && !bottomHidden && !rightHidden) addCornerBorderDiv(table, i, j, '43px', '45px');
                
            }
        }
    }

}

function cellIsHidden(table, i, j) {
    for (let listElem of table.rows[i].cells[j].className.split(' ')) {
        if (listElem == 'hidden' || listElem == 'mine') {
            return true;
        }
    }
}

// function addCornerBorderDiv(table, i, j, top, left) {
    
//     let div = document.createElement("div");
//     div.className = 'cornerBorder';
    
//     div.style.width = '5px';
//     div.style.height = '5px';
//     div.style.background = '#87af3a';

//     div.style.position = 'relative';
//     div.style.top = top;
//     div.style.left = left;
    
//     table.rows[i].cells[j].prepend(div);

// }