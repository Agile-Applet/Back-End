const { dealCards, checkCards, removeCards } = require("./utils/roundhelpers");
const { getRandomInt } = require("./utils/helpers");

class Controller {

    constructor(room, socketRoom) {
        this.room = room,
            this.socket = socketRoom;

        this.status = 'Start'; // Pause, Start, Bet, Turn, River, Show, End
        this.betround = 0;
        this.turn = 0;
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
        this.smallBlindTurn++;
        this.bigBlindTurn++;

        if (this.smallBlindTurn === this.room.getPlayerCount()) {
            this.smallBlindTurn = 0;
        } else if (this.bigBlindTurn === this.room.getPlayerCount()) {
            this.bigBlindTurn = 0;
        }

        this.playerData.forEach(element => {
            if (element.playerId === this.smallBlindTurn) {
                this.playerData[this.playerData.indexOf(element)] = {
                    playerId: element.playerId, playerName: element.playerName, seatStatus: element.seatStatus, money: element.money,
                    lastBet: 0, hand: dealCards(0, 'player'), showHand: false, avatar: element.avatar, handPosition: element.handPosition, role: ' (S)'
                }
            } else if (element.playerId === this.bigBlindTurn) {
                this.playerData[this.playerData.indexOf(element)] = {
                    playerId: element.playerId, playerName: element.playerName, seatStatus: element.seatStatus, money: element.money,
                    lastBet: 0, hand: dealCards(0, 'player'), showHand: false, avatar: element.avatar, handPosition: element.handPosition, role: ' (B)'
                }
            } else {
                if (element.playerName === 'Free') {
                    this.playerData[this.playerData.indexOf(element)] = {
                        playerId: element.playerId, playerName: element.playerName, seatStatus: 2, money: element.money,
                        lastBet: 0, hand: dealCards(0, 'player'), showHand: false, avatar: element.avatar, handPosition: element.handPosition, role: ''
                    }
                } else {
                    this.playerData[this.playerData.indexOf(element)] = {
                        playerId: element.playerId, playerName: element.playerName, seatStatus: element.seatStatus, money: element.money,
                        lastBet: 0, hand: dealCards(0, 'player'), showHand: false, avatar: element.avatar, handPosition: element.handPosition, role: ''
                    }
                }
            }
            removeCards(0);
        });
        this.next('Start');
    };

    /* Return current player turn */
    playerTurn() {
        return parseFloat(this.turn);
    };

    /* Set current player turn */
    setPlayerTurn(data) {
        this.turn += data;
    };

    /* Return current game status */
    gameStatus() {
        return this.status;
    };

    /* Set current game status */
    setGameStatus(data) {
        this.status = data;
    };

    /* Handle Bet Round */
    betRound() {
        this.betround++;
        this.socket.in("Table 1").emit('playerTurn', {});
        /* Kun Bet ohi
        this.status = 'Flop';
        this.flopRound();
        */
    };

    /* Handle Flop Round */
    flopRound() {
        this.tableData.push({ pot: 0.00, cards: dealCards(0, 'dealer'), status: this.status });
        this.next('Flop');
    };

    /* Handle River Round */
    riverRound() {
        // TBD
        /* Kun River ohi
       this.status = 'Check';
       this.next('Check');
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
                this.socket.emit('startGame', true);
                this.status = 'River';
                this.next('River');
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
