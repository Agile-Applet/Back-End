const { Deck } = require("./Deck");
const { checkCards } = require("./utils/roundhelpers");

class Controller {

    constructor(room, socketRoom) {
        this.room = room,
            this.socket = socketRoom;
        this.status = 'Pause'; // Pause, Start, Bet, Turn, River, Show, End
        this.betround = 0;
        this.turn = 0;
        this.firstActiveIndex = 0;
        this.turnGiven = 0;
        this.totalBet = 0;
        this.currentBet = 0;
        this.activePlayers = 0;
        this.blindsGiven = 0;
        this.roomData = [];
        this.tableData = [];
        this.statuses = ['Flop', 'Turn', 'River', 'Check'];
        this.deck = new Deck();
    }

    /* Start a new game */
    startGame = (data) => {
        this.status = "Start";
        this.roomData = data;
        this.tableData = [];
        this.statuses = ['Flop', 'Turn', 'River', 'Check'];
        this.totalBet = 0;
        this.currentBet = 100; // same than big blind
        this.activePlayers = 0;
        this.blindsGiven = 0; // ? 
        let seatStatus = 0;
        this.deck.resetDeck();

        this.roomData.forEach(element => {
            let elementIndex = this.roomData.indexOf(element);
            if (element.status === 0) { // Description in seat class
                seatStatus = element.status;
            } else {
                seatStatus = 2;
                this.activePlayers++;
            }
            this.roomData[elementIndex].setStatus(seatStatus);
            this.roomData[elementIndex].getPlayer().setRole('');
            this.roomData[elementIndex].getPlayer().setLastBet(0);
            this.roomData[elementIndex].setTurn(false);
            this.roomData[elementIndex].getPlayer().setHand(this.deck.dealCards(2));
            element.status === 2 ? this.socket.to(element.player.getSocketId()).emit("playerHand", this.roomData[elementIndex].getPlayer().getHand()) : null;
        });
            this.setStartPlayer();

            this.roomData[this.turn].setTurn(true);
            this.socket.emit('resetTableCards', this.tableData);
            this.socket.emit('updatePlayer', this.roomData);
        

        this.next('Start');
    };

    setStartPlayer() {
        let playerSelected = false;
        let index = this.firstActiveIndex;
        while(!playerSelected){
            index++;
            if (index >= 6) index = 0;
            if (this.roomData[index].getStatus() === 2){
                this.turn = index;
                this.firstActiveIndex = index;
                playerSelected = true;
            }
        }

        let rolesAdded = false;
        let bigBlindSet = false;
        while(!rolesAdded){
            --index;
            if (index < 0) index = 5;

            if (this.roomData[index].getStatus() === 2){
                if (!bigBlindSet){
                    this.roomData[index].getPlayer().setRole(' (B)');
                    this.roomData[index].getPlayer().deductMoney(100);
                    this.roomData[index].getPlayer().setLastBet(100);
                    bigBlindSet = true;
                }else{
                    this.roomData[index].getPlayer().setRole(' (S)');
                    this.roomData[index].getPlayer().deductMoney(50);
                    this.roomData[index].getPlayer().setLastBet(50);
                    rolesAdded = true;
                }
            }
        }
    }

    /* Handle Betting */
    handleBet(bet) {    
            this.currentBet = bet;
            this.betround = 1;
            this.setPlayerTurn(1);
            return true;
    };

    /* Handle Checking */
    handleCheck() {
        this.betround++;
        this.setPlayerTurn(1);
    };

    /* Handle Folding */
    handleFold(player) {
        player.setStatus(1);
        this.activePlayers--;
        this.setPlayerTurn(1);
    };

    /* Return current player turn */
    getPlayerTurn() {
        return parseInt(this.turn);
    };

    /* Set current player turn
     - Updates the front regularly and ensures that the current turn is seen
  */
    setPlayerTurn(data) {        
        this.turn += data;

        if (this.turn >= 6 ) { // start from 0 when out of bounds
            this.turn = 0;
        }

        if( this.betround == this.activePlayers ){ // if all have pressed bet/check/call/fold
            this.betround = 0;
            this.status = this.statuses[0];
            this.next(this.statuses[0]);
        }

        if(this.roomData[this.turn].getStatus() === 2){

            if(this.activePlayers === 1){ // if all except one fold
                this.socket.emit('userError', { action: "end_game", status: "success", message: this.roomData[this.turn].getPlayer().getName() + " voitti " + this.totalBet + " €! Uusi peli alkaa hetken kuluttua." });
                this.status = 'Pause';
                this.next('Pause');
            } else{  
                this.roomData.forEach(element => { 
                    if (this.turn == element.id) {
                        this.roomData[element.id].setTurn(true);
                    } else {
                        this.roomData[element.id].setTurn(false);
                    }
                    this.socket.emit('updatePlayer', this.roomData)
                })
            }
        } else{ // if seat empty or player waiting next game
            this.setPlayerTurn(1);
        }
    };

    /* Return current game status */
    getGameStatus() {
        return this.status;
    };

    /* Set current game status */
    setGameStatus(data) {
        this.status = data;
    };

    /* Handle Bet Round */
    betRound() {
        this.socket.emit('syncGame', true);
    };

    /* Handle Flop Round */
    turnChange() {
        this.currentBet = 0;
        this.statuses.splice(0, 1);
        this.roomData.forEach(element => {
            this.totalBet += element.getPlayer().getLastBet();
            element.getPlayer().setLastBet(0);
        });
        this.tableData[0] = { pot: this.totalBet, cards: this.tableData[0].cards, status: this.status };
        this.socket.emit('updateTableCards', this.tableData);
    };

    /* Determine the winner */
    checkHands(data) {
        data.forEach(player => {
            if (player.getStatus() === 2) {
                this.tableData[0].cards.forEach(card => {
                    player.getPlayer().getHand().push(card);
                });
            }
        });
        let winner = checkCards(data);
        this.announceWinner(winner);
    };

    announceWinner(winner) {
        this.roomData[winner.split("=")[0]].money += this.totalBet;
        this.socket.emit('userError', { action: "end_game", status: "success", message: this.roomData[winner.split("=")[0]].getPlayer().getName() + " voitti (" + winner.split("=")[1] + ") " + this.totalBet + " €! Uusi peli alkaa hetken kuluttua." });
        this.socket.emit('updatePlayer', this.roomData);
        this.status = 'Pause';
        this.next('Pause');
    };

    pauseGame = () => {
        /* TBD */
        setTimeout(() => {
            this.smallBlindTurn = -1;
            this.bigBlindTurn = 0;
            this.startGame(this.roomData);
        }, 5000);
    };

    /* Game Flow */
    next = () => {
        switch (this.status) {
            case 'Start':
                if (this.room.getPlayerCount() > 1) {
                    this.status = 'Bet';
                    this.next('Bet');
                }
                break;

            case 'Bet':
                this.betRound();
                break;

            case 'Flop':
                this.tableData.push({ pot: this.totalBet, cards: this.deck.dealCards(3), status: this.status });
                this.turnChange();
                break;

            case 'Turn':
            case 'River':
                this.tableData[0].cards.push(this.deck.getCard())
                this.turnChange();
                break;

            case 'Check':
                this.turnChange();
                this.checkHands(this.roomData);
                break;

            case 'Pause':
                // TBD
                this.pauseGame();
                break;

            default:
                // TBD
                break;
        }
    };
}

module.exports = { Controller }
