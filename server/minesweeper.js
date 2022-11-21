class Minesweeper {

    constructor(socket, tableSize, numMines) {

        this.socket = socket;
        this.tableSize = tableSize;
        this.numMines = numMines;

        this.table = [];
        this.status = 'game initialized';
        this.youWin = null;

    }

    // display

    display(message='update game') {

        let state = {
            id: this.socket.id,
            table: this.table,
            tableSize: this.tableSize,
            numMines: this.numMines,
            status: this.status,
            youWin: this.youWin
        };

        this.socket.emit(message, state);
        this.socket.broadcast.emit(`broadcast-${message}`, state);
        
    }

    // game

    createTable() {

        for (let i = 0; i < this.tableSize; i++) {
            this.table.push([]);
            for (let j = 0; j < this.tableSize; j++) {

                let parity = (i + j) % 2 == 0;
                let backgroundColor = parity ? 'even' : 'odd';

                this.table[i].push({
                    innerHTML: '',
                    className: `square hidden ${backgroundColor}`
                });

            }
        }

    }

    registerClick(click) {

        let [ x, y, type ] = [ click.x, click.y, click.type ];

        if (type == 'left'  && this.status == 'game initialized') this.fillTable(x, y);
        if (type == 'left'  && this.status == 'game started') this.clickSquare(x, y);
        if (type == 'right' && this.status == 'game started') this.flagMine(x, y);

        this.checkForWinner();
        this.display();

    }

    fillTable(x, y) {
        this.placeMinesAndInitialSquares(x, y);
        this.revealSurroundingSquares(x, y);
    }

    placeMinesAndInitialSquares(x, y) {

        let numMinesPlaced = 0;

        while (numMinesPlaced < this.numMines) {
    
            let mineX = this.randomInteger(0, 9);
            let mineY = this.randomInteger(0, 9);
    
            if (this.isAClickedSquare(mineX, mineY)) continue;
            if (this.isAMine(mineX, mineY)) continue;
    
            if (this.status == 'game initialized') {
                this.status = 'game started';
                for (let [i, j] of this.getSurroundingCoords(x, y)) {
                    this.revealSquare(i, j);
                }
            } else if (this.status == 'game started') {
                this.addClass(mineX, mineY, 'mine');
                numMinesPlaced++;
            }
            
        }

    }

    revealSurroundingSquares(x, y) {

        let squareCoordsToReveal = this.getSurroundingCoords(x, y);
    
        while (squareCoordsToReveal.length != 0) {
            let newSquareCoordsToReveal = [];
            for (let [i, j] of squareCoordsToReveal) {
                
                this.revealSquare(i, j);
                this.addNumMinesAround(i, j);
    
                if (this.numMinesAround(i, j) == 0 && !this.isAMine(i, j)) {
    
                    for (let [si, sj] of this.getSurroundingCoords(i, j)) {
    
                        if ((si != i || sj != j) && !this.isAClickedSquare(si, sj) && !this.isAMine(si, sj)) {                   
                            this.revealSquare(i, j);
                            this.addNumMinesAround(i, j);
                            newSquareCoordsToReveal.push([si, sj]);
                        }
    
                    }
    
                }
    
            }
            squareCoordsToReveal = [...newSquareCoordsToReveal];
        }
    
    }
    
    clickSquare(x, y) {
    
        if (this.isAFlag(x, y)) return;
            
        this.revealSquare(x, y);

        if (this.isAMine(x, y)) {
            this.status = 'game over';
            this.youWin = false;
        } else {
            this.addNumMinesAround(x, y);
            if (this.table[y][x].innerHTML === '') {
                this.revealSurroundingSquares(x, y);
            }
        }
        
    }
    
    checkForWinner() {
        
        let numClickedSquares = 0;
    
        for (let x = 0; x < this.tableSize; x++) {
            for (let y = 0; y < this.tableSize; y++) {
                if (this.isAClickedSquare(x, y)) {
                    numClickedSquares++;
                }
            }
        }
    
        if (numClickedSquares === this.tableSize * this.tableSize - this.numMines) {
            this.status = 'game over';
            this.youWin = true;
            this.display();
        }
    
    }
    
    revealSquare(x, y) {
        this.removeClass(x, y, 'hidden');
        this.addClass(x, y, 'clickedSquare');
    }
    
    addNumMinesAround(x, y) {
        let numMinesAroundSquare = this.numMinesAround(x, y);
        this.table[y][x].innerHTML = numMinesAroundSquare === 0 ? '' : numMinesAroundSquare;
    }

    numMinesAround(x, y) {
        return this.getSurroundingCoords(x, y).filter(e => this.isAMine(e[0], e[1])).length;
    }
    
    flagMine(x, y) {
        if (this.isAFlag(x, y)) {
            this.removeClass(x, y, 'flag')
        } else {
            this.addClass(x, y, 'flag');
        }
    }
    
    getSurroundingCoords(x, y) {

        let allPossibleCoords = [
            [x-1, y-1], [x-1, y], [x-1, y+1], 
            [x,   y-1], [x,   y], [x,   y+1], 
            [x+1, y-1], [x+1, y], [x+1, y+1]
        ];

        return allPossibleCoords.filter(c => 0 <= c[0] && c[0] <= this.tableSize - 1 && 0 <= c[1] && c[1] <= this.tableSize - 1);

    }

    isAClickedSquare(x, y) {
        return this.table[y][x].className.includes('clickedSquare');
    }

    isAFlag(x, y) {
        return this.table[y][x].className.includes('flag');
    }

    isAMine(x, y) {
        return this.table[y][x].className.includes('mine');
    }

    addClass(x, y, className) {
        if (!this.isAClickedSquare(x, y)) {
            this.table[y][x].className += ` ${className}`;
        }
    }

    removeClass(x, y, className) {
        let newClassName = '';
        for (let classElem of this.table[y][x].className.split(' ')) {
            if (classElem != className) {
                newClassName += `${classElem} `;
            }
        }
        this.table[y][x].className = newClassName.slice(0, -1);
    }

    randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }


}

export default Minesweeper;