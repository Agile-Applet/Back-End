const { dealCards, checkCards, removeCards, createDeck } = require("./utils/roundhelpers");
const { getRandomInt } = require("./utils/helpers");

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
        this.playerData = [];
        this.tableData = [];
        this.statuses = ['Flop', 'Turn', 'River', 'Check'];
    }

    /* Start a new game */
    startGame = (data) => {
        this.status = "Start";
        this.playerData = data;
        this.tableData = [];
        this.statuses = ['Flop', 'Turn', 'River', 'Check'];
        this.totalBet = 0;
        this.activePlayers = 0;
        this.smallBlindTurn++;
        this.bigBlindTurn++;
        let role = '';
        let seatStatus = 0;
        let lastBet = 0;

        if (this.smallBlindTurn === this.room.getPlayerCount()) {
            this.smallBlindTurn = 0;
        } else if (this.bigBlindTurn === this.room.getPlayerCount()) {
            this.bigBlindTurn = 0;
        }

        this.playerData.forEach(element => {
            if (element.playerName === 'Free') {
                seatStatus = 2;
            } else {
                seatStatus = element.seatStatus;
                this.activePlayers++;
            }
            if (element.playerId === this.smallBlindTurn) {
                role = ' (S)';
                lastBet = 50;
            } else if (element.playerId === this.bigBlindTurn) {
                role = ' (B)';
                lastBet = 100;
            } else {
                role = '';
                lastBet = 0;
            }
            this.playerData[this.playerData.indexOf(element)] = {
                playerId: element.playerId, playerName: element.playerName, seatStatus: seatStatus, money: element.money - lastBet,
                lastBet: lastBet, hand: dealCards(0, 'player'), showHand: false, avatar: element.avatar, handPosition: element.handPosition, role: role
            }
            this.turn = this.playerData.indexOf(element);
            removeCards(0);
        });
        if (this.activePlayers < 3) {
            this.turn = 0;
            this.playerData[this.turn] = ({ ...this.playerData[this.turn], hasTurn: true });
            this.socket.emit('resetTableCards', this.tableData);
            this.socket.emit('updatePlayer', this.playerData);
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
        if (bet == this.playerData[index].lastBet) {
            this.setPlayerTurn(1);
            this.betround++;
            if (this.betround == this.activePlayers - 1) {
                this.betround = 0;
                this.status = this.statuses[0];
                this.next(this.statuses[0]);
            }
            return true;
        } else if (bet > this.playerData[index].lastBet) {
            this.setPlayerTurn(1);
            this.betround = 0;
            return true;
        } else {
            return false;
        }
    };

    /* Return current player turn */
    getPlayerTurn() {
        return parseFloat(this.turn);
    };

    /* Set current player turn
     - Updates the front regularly and ensures that the current turn is seen
  */
    setPlayerTurn(data) {
        this.turn += data;
        if (this.turn == this.activePlayers) {
            this.turn = 0;
        }
        this.playerData.forEach(player => {
            if (this.turn == player.playerId) {
                this.playerData[player.playerId] = ({ ...this.playerData[player.playerId], hasTurn: true });
            } else {
                this.playerData[player.playerId] = ({ ...this.playerData[player.playerId], hasTurn: false });
            }
            this.socket.emit('updatePlayer', this.playerData)
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
        this.playerData.forEach(element => {
            this.totalBet += element.lastBet;
        });
        this.tableData[0] = { pot: this.totalBet, cards: this.tableData[0].cards, status: this.status };
        this.socket.emit('updateTableCards', this.tableData);
    };

    /* Determine the winner */
    checkHands(data) {
        data.forEach(player => {
            if (player.playerName !== 'Free') {
                this.tableData[0].cards.forEach(card => {
                    player.hand.push(card);
                });
            }
        });
        let winner = checkCards(data);
        this.playerData[winner].money += this.totalBet;

        this.socket.emit('userError', { action: "end_game", status: "success", message: this.playerData[winner].playerName + " voitti " + this.totalBet + " €! Uusi peli alkaa hetken kuluttua." });
        this.socket.emit('updatePlayer', this.playerData);
        this.status = 'Pause';
        this.next('Pause');
    };

    pauseGame = () => {
        /* TBD */
        setTimeout(() => {
            this.smallBlindTurn = -1;
            this.bigBlindTurn = 0;
            createDeck();
            this.startGame(this.playerData);
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
                this.tableData.push({ pot: this.totalBet, cards: dealCards(0, 'dealer'), status: this.status });
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
                this.checkHands(this.playerData);
                break;

            case 'Pause':
                // TBD
                this.pauseGame();
                break;

            default:
                // TBD
                break;
        }
    }
}

module.exports = { Controller }
