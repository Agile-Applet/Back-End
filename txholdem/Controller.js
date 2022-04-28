const { Deck } = require("./Deck");
const { checkCards } = require("./utils/roundhelpers");

class Controller {

    constructor(room, socketRoom) {
        this.room = room,
            this.socket = socketRoom;
        this.status = 'Pause'; // Pause, Start, Bet, Turn, River, Show, End
        this.betround = 0;
        this.turn = 0;
        this.totalBet = 0;
        this.activePlayers = 0;
        this.smallBlindTurn = -1;
        this.bigBlindTurn = 0;
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
        this.activePlayers = 0;
        this.smallBlindTurn++;
        this.bigBlindTurn++;
        let role = '';
        let seatStatus = 0;
        let lastBet = 0;
        this.deck.resetDeck();

        if (this.smallBlindTurn === this.room.getPlayerCount()) {
            this.smallBlindTurn = 0;
        } else if (this.bigBlindTurn === this.room.getPlayerCount()) {
            this.bigBlindTurn = 0;
        }

        this.roomData.forEach(element => {
            let elementIndex = this.roomData.indexOf(element);
            if (element.status === 0) {
                seatStatus = 2;
            } else {
                seatStatus = element.status;
                this.activePlayers++;
            }
            if (element.id === this.smallBlindTurn) {
                role = ' (S)';
                lastBet = 50;
            } else if (element.id === this.bigBlindTurn) {
                role = ' (B)';
                lastBet = 100;
            } else {
                role = '';
                lastBet = 0;
            }
            this.roomData[elementIndex].setStatus(seatStatus);
            this.roomData[elementIndex].getPlayer().deductMoney(lastBet);
            this.roomData[elementIndex].getPlayer().setLastBet(lastBet);
            this.roomData[elementIndex].getPlayer().setRole(role);
            this.roomData[elementIndex].getPlayer().setHand(this.deck.dealCards(2));
            this.turn = elementIndex;
        });
        if (this.activePlayers < 3) {
            this.turn = 0;
            this.roomData[this.turn].setTurn(true);
            this.socket.emit('resetTableCards', this.tableData);
            this.socket.emit('updatePlayer', this.roomData);
        }
        this.next('Start');
    };

    /* Handle Betting */
    checkBet(bet, index) {
        if (index == 0) {
            index++;
        } else {
            index--;
        }
        /* Check that current player bets enough */
        if (bet == this.roomData[index].getPlayer().getLastBet()) {
            this.setPlayerTurn(1);
            this.betround++;
            if (this.betround == this.activePlayers - 1) {
                this.betround = 0;
                this.status = this.statuses[0];
                this.next(this.statuses[0]);
            }
            return true;
        } else if (bet > this.roomData[index].getPlayer().getLastBet()) {
            this.setPlayerTurn(1);
            this.betround = 0;
            return true;
        } else {
            return false;
        }
    };

    /* Handle Checking */
    validateCheck(playerCount) {
        let lastBet = 0;
        let currentBet = this.roomData[this.getPlayerTurn()].player.getLastBet();

        if (this.getPlayerTurn() == 0) {
            lastBet = this.roomData[playerCount - 1].player.lastBet;
        } else {
            lastBet = this.roomData[this.getPlayerTurn() - 1].player.getLastBet();
        }

        if (currentBet >= lastBet) {
            this.setPlayerTurn(1);
            this.betround++;
            if (this.betround == this.activePlayers - 1) {
                this.betround = 0;
                this.status = this.statuses[0];
                this.next(this.statuses[0]);
            }
            return true;
        } else {
            return false;
        }
    };

    /* Handle Folding */
    validateFold(playerCount) {
        let winnerIndex = 0;

        if (playerCount < 3) {
            winnerIndex += 1;
            this.roomData[winnerIndex].money += this.totalBet;
            this.socket.emit('userError', { action: "end_game", status: "success", message: this.roomData[winnerIndex].getPlayer().getName() + " voitti " + this.totalBet + " €! Uusi peli alkaa hetken kuluttua." });
            this.socket.emit('updatePlayer', this.roomData);
            this.status = 'Pause';
            this.next('Pause');
        } else {
            this.setPlayerTurn(1);
        }
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
        if (this.turn == this.activePlayers) {
            this.turn = 0;
        }
        this.roomData.forEach(element => {
            if (this.turn == element.id) {
                this.roomData[element.id].setTurn(true);
            } else {
                this.roomData[element.id].setTurn(false);
            }
            this.socket.emit('updatePlayer', this.roomData)
        })
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
        this.totalBet = 50;
        this.statuses.splice(0, 1);
        this.roomData.forEach(element => {
            this.totalBet += element.getPlayer().getLastBet();
        });
        this.tableData[0] = { pot: this.totalBet, cards: this.tableData[0].cards, status: this.status };
        this.socket.emit('updateTableCards', this.tableData);
    };

    /* Determine the winner */
    checkHands(data) {
        data.forEach(player => {
            if (player.getPlayer().getName() !== 'Free') {
                this.tableData[0].cards.forEach(card => {
                    player.getPlayer().getHand().push(card);
                });
            }
        });
        let winner = checkCards(data);
        this.roomData[winner].money += this.totalBet;

        this.socket.emit('userError', { action: "end_game", status: "success", message: this.roomData[winner].getPlayer().getName() + " voitti " + this.totalBet + " €! Uusi peli alkaa hetken kuluttua." });
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
                this.tableData.push({ pot: this.totalBet, cards: this.deck.dealCards(5), status: this.status });
                this.turnChange();
                break;

            case 'Turn':
                this.turnChange();
                break;

            case 'River':
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
