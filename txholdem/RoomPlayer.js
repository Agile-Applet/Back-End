/* Texas Holdem Player */
const { Player } = require("./Player");
//const { getHandPosition } = require('./utils/helpers');

// { playerId: 5, playerName: 'Free', seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: true, handPosition: 'player-cards-right', avatar: '', role: '' }

class RoomPlayer extends Player {

    constructor(id, name, money, avatar, socketId, seatId, lastBet, role) {
        super(id, name, money, avatar);
        this.socketId = socketId;
        this.seatId = seatId;
        this.lastBet = 0;
        this.hand = [],
        this.showHand = false;
        this.handPosition = "player-cards-right";
        this.role = role;
    }

    getSocketId = () => (this.socketId);

    setSeat = (seatId) => this.seatId(seatId);
    getSeat = () => (this.seatId);

    setLastbet = (amount) => this.lastBet(amount);
    getLastbet = () => (this.lastBet);

    setHand = (hand) => this.hand(hand);
    getHand = () => (this.hand);

    setShowHand = (status) => this.showHand(status);
    getHandStatus = () => (this.showHand);
 
}

module.exports = { RoomPlayer }
