const { Deck } = require("./Deck");

class Controller {

    constructor(room, socketRoom) {
        this.room = room,
        this.socket = socketRoom;

        this.deck = new Deck();
        this.status = 'Start'; // Pause, Start, End
        this.playerStart = 0;
        this.activePlayers = 0;
        this.betround = 0;
        this.turn = 0;
        this.playerData = [];
        this.tableData = [];
        this.roles = Array(6).fill('');

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
        this.roles.fill('');
        this.deck.resetDeck();
        this.playerStart = this.nextTurn(this.playerStart, true);

        this.playerData.forEach((element, index) => {
            if (element.playerName === 'Free') {
                this.playerData[this.playerData.indexOf(element)] = {
                    playerId: element.playerId, playerName: element.playerName, seatStatus: 2, money: element.money,
                    lastBet: 0, hand: this.deck.dealCards(2), showHand: false, avatar: element.avatar, handPosition: element.handPosition, role: '', status: 'fold' 
                }
            }else{
                this.addPlayer();
                this.playerData[this.playerData.indexOf(element)] = {
                    playerId: element.playerId, playerName: element.playerName, seatStatus: element.seatStatus, money: element.money,
                    lastBet: 0, hand: this.deck.dealCards(2), showHand: false, avatar: element.avatar, handPosition: element.handPosition, role: this.roles[index], status: 'wait'
                }
            }
        });
        this.next('Start');
    };

    /* Return current player turn */
    getPlayerTurn() {
        return parseFloat(this.turn);
    };

    /* Set current player turn */
    setPlayerTurn(data) {
        this.turn = data;
    };

    /* Return current game status */
    getGameStatus() {
        return this.status;
    };

    /* Set current game status */
    setGameStatus(data) {
        this.status = data;
    };

    addPlayer() {
        this.activePlayers++;
    }

    removePlayer() {
        this.activePlayers--;
        if (this.activePlayers === 1) console.log('we got a winner')
    }

    /* Handle Bet Round */
    betRound() {
        this.betround++;
        this.resetStatusOnAll();
        this.socket.in("Table 1").emit('playerTurn', {});
        this.socket.emit('syncGame', true);

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
        console.log('pause');
        setTimeout(() => {
            this.socket.emit('userError', { action: 'pause_game', status: 'success', message: "Puolen minuutin tauko." });
        }, 3000);
    }

    /* Game Flow */
    next = () => {
        switch (this.status) {
            case 'Start':
                if (this.room.getPlayerCount() > 1) {
                    this.betRound();
                }
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

    nextRound() {
        switch(this.betround){
            case 1: // Flop
                this.tableData.push({ pot: 0.00, cards: this.deck.dealCards(3), status: this.status });
                this.socket.emit('updateTableCards', this.tableData);
                this.betRound();
                break;
            case 2: // Turn
            case 3: // River
                this.tableData[0].cards.push(this.deck.getCard());
                console.log(this.tableData[0])
                this.socket.emit('updateTableCards', this.tableData);
                this.betRound();
                break;
            case 4: // End
                this.checkHands(this.playerData);
                break;
        }
    }

    resetStatusOnAll() {
        this.playerData.forEach((element, index) => {
            if(element.status != 'fold')
            this.playerData[index] = { ...this.playerData[index], status : 'wait' };
        })
    }

    assistBlinds(index, role) {
            index--;
            if(index < 0) index = this.playerData.length -1;
        if(typeof this.playerData[index] !== 'undefined' && this.playerData[index].seatStatus === 1) {
            this.roles[index] = role;
            if (role === ' (B)') {
                this.assistBlinds(index, ' (S)')
            }
        }else{
            this.assistBlinds(index, role);
        }    
}

    nextTurn(index, startRound = false) {
        index++;
        if (index >= this.playerData.length) index = 0;
        if(typeof this.playerData[index] !== 'undefined' && this.playerData[index].seatStatus === 1 ) {
            if (this.playerData[index].status != 'fold' || startRound) {
                this.setPlayerTurn(index);
                if(this.playerData[index].status === 'check' || this.playerData[index].status === 'bet'){
                        if(this.activePlayers === 1) {
                            console.log(this.playerData[index].playerName + ' is the winner');
                        }else {
                            this.nextRound();
                        }

                }
                if (startRound){
                    this.assistBlinds(index, ' (B)', this.playerData);
                }
                return index;
            }else {
                this.nextTurn(index, startRound);
            }
        }else{
            this.nextTurn(index, startRound)
        }
    }
}

module.exports = { Controller }
