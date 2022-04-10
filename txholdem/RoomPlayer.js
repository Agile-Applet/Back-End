/* Texas Holdem Player */
const { Player } = require("./Player");
const { getHandPosition } = require('./utils/helpers');

//{ ...this.playerData[usr.seat], playerName: "Free Seat", seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: false, avatar: '' };

class RoomPlayer extends Player {

    constructor(id, name, money, avatar, socketId, seatId, lastBet) {
        super(id, name, money, avatar);
        this.socketId = socketId;
        this.seatId = seatId;
        this.lastBet = 0;
        this.hand = [],
        this.showHand = false;
        this.handPosition = getHandPosition(seatId);
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
