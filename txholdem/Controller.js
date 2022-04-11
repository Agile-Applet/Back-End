const { dealCards, checkCards, removeCards } = require("./utils/roundhelpers");
const { getRandomInt } = require("./utils/helpers");

class Controller {

    constructor(room, socketRoom) {
        this.room = room,
            this.socket = socketRoom;

        this.status = 'Pause'; // Pause, Start, Bet, Turn, River, Show, End
        this.betround = 0;
        this.turn = 0;
        this.activePlayers = 0;
        this.totalBet = 50;
        this.smallBlindTurn = -1;
        this.bigBlindTurn = 0;
        this.playerData = [];
        this.tableData = [];
    }

    /*  
        PANOSTUSKIERROS: 
            - Ennen ja jälkeen jokaisen kortin/korttien paljastamista pelaajat panostavat vuorollaan.
            - Pysyäkseen mukana kädessä ja nähdäkseen seuraavan kortin jokaisen pelaajan täytyy laittaa sama määrä merkkejä pottiin kuin muut ovat laittaneet

        PELINKULKU:
            1. Jokaiselle pelaajalle jaetaan kaksi korttia, jotka vain he itse saavat katsoa
            1.1 Panostuskierros 
            2. Jakaja jakaa kolme korttia ("FLOP")
            2.1 Panostuskierros
            3. Jakaja jakaa neljännen kortin ("TURN")
            3.1 Panostuskierros
            4. Jakaja jakaa viidenen kortin ("RIVER")
            3.2 Panostuskierros
            5. Näyttö & voittava käsi/tarkastukset ("CHECK")
    */

    /* Start a new game */
    startGame = (data) => {
        this.status = "Start";
        this.playerData = data;
        this.tableData = [];
        this.totalBet = 50;
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
        }
        this.next('Start');
    };

    /* Handle Betting */
    checkBet(bet, index) {
        console.log('index:  ' + index);
        if (index == 0) {
            index++;
        } else {
            index--;
        }
        console.log('index:  ' + index);
        console.log('bet:  ' + bet);
        console.log('lastBet:  ' + this.playerData[index].lastBet);
        /* Check that current player bets enough */
        if (bet == this.playerData[index].lastBet) {
            this.setPlayerTurn(1);
            this.betround++;
            console.log('this.betround:  ' + this.betround);
            console.log(this.betround == this.activePlayers - 1);
            if (this.betround == this.activePlayers - 1) {
                this.status = 'Flop';
                this.betround = 0;
                this.flopRound();
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

    /* Set current player turn */
    setPlayerTurn(data) {
        this.turn += data;
        if (this.turn == this.activePlayers) {
            this.turn = 0;
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
        /* Kun Bet ohi
        this.status = 'Flop';
        this.flopRound(); 
        */
    };

    /* Handle Flop Round */
    flopRound() {
        this.playerData.forEach(element => {
            this.totalBet += element.lastBet;
        });
        this.tableData.push({ pot: this.totalBet, cards: dealCards(0, 'dealer'), status: this.status });
        this.next('Flop');
    };

    /* Handle Turn Round */
    turnRound() {
        // TBD
        /* Kun Turn ohi
       this.status = 'Check';
       this.next('Check');
       */
    };

    /* Handle River Round */
    riverRound() {
        // TBD
        /* Kun River ohi
       this.status = 'Turn';
       this.next('Turn');
       */
    };

    /* Determine the winner */
    checkHands(data) {
        data.forEach(element => {
            if (element[0]) {
                element.push({ card: this.tableData[0].cards[0].card });
            }
        });
        /*
        let winner = checkCards(data);
        this.socket.emit('userError', { action: "end_game", status: "success", message: "${winner} voitti tms." });
        */
        /* Kun Check ohi
       this.status = 'Pause';
       this.next('Pause');
       */
    };

    pauseGame = () => {
        // TBD
        setTimeout(() => {
            this.socket.emit('userError', { action: 'pause_game', status: 'success', message: "Puolen minuutin tauko." });
        }, 3000);
    }

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
                // TBD
                this.betRound();
                break;

            case 'Flop':
                this.socket.emit('updateTableCards', this.tableData);
                //this.socket.emit('syncGame', true);
                //this.status = 'River';
                //this.next('River');
                break;

            case 'Turn':
                // TBD
                this.turnRound();
                break;

            case 'River':
                // TBD
                this.riverRound();
                break;

            //Aka Check/End/Show
            case 'Check':
                this.checkHands(this.playerData);
                // TBD
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
