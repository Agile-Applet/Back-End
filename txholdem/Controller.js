const { dealCards, checkCards, removeCards } = require("./utils/roundhelpers");
const { getRandomInt } = require("./utils/helpers");

class Controller {

    constructor(room, socketRoom) {
        this.room = room,
            this.socket = socketRoom;

        this.status = "Start"; // Pause, Start, Bet, Turn, River, Show, End
        this.betround = 0;
        this.turn = 0;
        this.smallBlindTurn = -1;
        this.bigBlindTurn = 0;
        this.playerData = [];
        this.tableData = [];

        //setTimeout(() => this.testMethod(), 5000, 1); // Run test method in 5 seconds
    }

    /* Testimetodi, jossa controlleri lähettää koko pöydälle dataa */
    /*
        testMethod = () => {
            console.log("Test method executed.");
            this.socket.in("Pöytä 1").emit('userError', { action: "test_message", status: "failed", message: "Testimetodin viesti pöytäryhmälle onnistui." });
            setTimeout(() => console.log(this.room.getPlayerData()), 5000, 1);
        }
    */
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
            5. Näyttö & voittava käsi/tarkastukset ("SHOW")
    */

    /* Nää on vasta hahmottelun tasolla. */

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
                this.playerData[this.playerData.indexOf(element)] = {
                    playerId: element.playerId, playerName: element.playerName, seatStatus: element.seatStatus, money: element.money,
                    lastBet: 0, hand: dealCards(0, 'player'), showHand: false, avatar: element.avatar, handPosition: element.handPosition, role: ''
                }
            }
            removeCards(0);
        });
        this.next('Start');
    };

    playerTurn() {
        return parseFloat(this.turn);
    };

    setPlayerTurn(data) {
        this.turn += data;
    };

    gameStatus() {
        return this.status;
    };

    setGameStatus(data) {
        this.status = data;
    };

    betRound() {
        this.betround++;
        this.socket.in("Pöytä 1").emit('playerTurn', {});
        this.flopRound();
    };

    flopRound() {
        this.status = 'Flop';
        this.tableData.push({ pot: 0.00, cards: dealCards(0, 'dealer'), status: this.status });
        this.next('Flop');
    };

    checkHands(data) {
        data.forEach(element => {
            if (element[0]) {
                element.push({ card: this.tableData[0].cards[0].card });
            }
        });
        checkCards(data);
        this.next('End');
    };

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
                // TBD
                console.log(this.tableData);
                this.socket.emit('updateTableCards', this.tableData);
                this.socket.emit('startGame', true);
                break;

            case 'River':
                // TBD
                break;

            case 'Show':
                // TBD
                break;

            case 'End':
                this.endGame();
                // TBD
                break;

            default:
                // TBD
                break;
        }
    }

    endGame = () => {
        this.status = "End";
        this.betround = 0;
        /*
        this.socket.in("Pöytä 1").emit('TAPAHTUMAN_NIMI');
        */
        this.socket.emit('userError', { action: "check_hand", status: "success", message: "Joku voitti" });
    }
}

module.exports = { Controller }