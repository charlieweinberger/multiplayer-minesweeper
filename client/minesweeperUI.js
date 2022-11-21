let socket = io();

socket.emit('connection');

socket.on('initialize game', (state) => {
    console.log(`initialize game: ${state.id}`);
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

function createGame(id, state) {

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

    for (let i = 0; i < state.tableSize; i++) {
        let row = table.insertRow();
        for (let j = 0; j < state.tableSize; j++) {
            let square = row.insertCell();
            square.className = state.table[i][j].className;
            square.innerHTML = state.table[i][j].innerHTML;
        }
    }

    // add divs

    boardDiv.appendChild(table);
    column.appendChild(boardDiv);
    document.getElementById("row").appendChild(column);
    
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

            table.rows[i].cells[j].innerHTML = `<b>${state.table[j][i].innerHTML}</b>`;
            table.rows[i].cells[j].className = state.table[j][i].className;
            table.rows[i].cells[j].style.color = colorMap[state.table[j][i].innerHTML];

        }
    }

    // instead of checking for 'hidden', check for something else, so that mines being revealed don't remove the borders

    for (let i = 0; i < state.tableSize; i++) {
        for (let j = 0; j < state.tableSize; j++) {

            if (state.table[j][i].innerHTML != '') {

                const BORDER_WIDTH = '5px';
                const BORDER_COLOR = '#87af3a';

                let topHidden, bottomHidden, leftHidden, rightHidden, topLeftHidden, topRightHidden, bottomLeftHidden, bottomRightHidden;

                if (i > 0)                   topHidden    = cellIsHidden(i-1, j);
                if (i < state.tableSize - 1) bottomHidden = cellIsHidden(i+1, j);
                if (j > 0)                   leftHidden   = cellIsHidden(i, j-1);
                if (j < state.tableSize - 1) rightHidden  = cellIsHidden(i, j+1);

                if (i > 0 && j > 0)                                     topLeftHidden     = cellIsHidden(i-1, j-1);
                if (i > 0 && j < state.tableSize - 1)                   topRightHidden    = cellIsHidden(i-1, j+1);
                if (i < state.tableSize - 1 && j > 0)                   bottomLeftHidden  = cellIsHidden(i+1, j-1);
                if (i < state.tableSize - 1 && j < state.tableSize - 1) bottomRightHidden = cellIsHidden(i+1, j+1);

                // side borders

                const border = `${BORDER_WIDTH} solid ${BORDER_COLOR}`;
                
                table.rows[i].cells[j].style.borderTop    = (topHidden)    ? border : '';
                table.rows[i].cells[j].style.borderBottom = (bottomHidden) ? border : '';
                table.rows[i].cells[j].style.borderLeft   = (leftHidden)   ? border : '';
                table.rows[i].cells[j].style.borderRight  = (rightHidden)  ? border : '';

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

                //     table.rows[i].cells[j].appendChild(div);

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

                //     table.rows[i].cells[j].appendChild(div);

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

                //     table.rows[i].cells[j].appendChild(div);

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

                //     table.rows[i].cells[j].appendChild(div);

                // }
                
            }
            
            // else {
            //     table.rows[i].cells[j].style.border = '';
            //     for (const cornerBorder of document.getElementsByClassName('cornerBorder')) {
            //         cornerBorder.style.visibility = 'hidden';
            //     }
            // }

        }
    }

    // if (state.status == 'game over') {
    //     statusHTML.innerHTML = state.youWin ? 'You Win!' : 'You Lose!';
    // }

}

function getSurroundingCoords(x, y, tableSize) {

    let allPossibleCoords = [
        [x-1, y-1], [x-1, y], [x-1, y+1], 
        [x,   y-1], [x,   y], [x,   y+1], 
        [x+1, y-1], [x+1, y], [x+1, y+1]
    ];

    return allPossibleCoords.filter(c => 0 <= c[0] && c[0] <= tableSize - 1 && 0 <= c[1] && c[1] <= tableSize - 1);

}

function cellIsHidden(i, j) {
    for (let listElem of table.rows[i].cells[j].className.split(' ')) {
        if ('hidden' === listElem) {
            return true;
        }
    }
    return false;
}