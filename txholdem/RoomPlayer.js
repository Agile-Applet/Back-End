/* Texas Holdem Player */
const { Player } = require("./Player");

class RoomPlayer extends Player {

    constructor(id, name, money, avatar, socketId, seatId, lastBet, role) {
        super(id, name, money, avatar);
        this.socketId = socketId;
        this.seatId = seatId;
        this.lastBet = 0;
        this.hand = [],
        this.showHand = false;
        this.role = role;
    }

    getSocketId = () => (this.socketId);

    setSeat = (seatId) => this.seatId = seatId;
    getSeat = () => (this.seatId);

    setLastBet = (amount) => {this.lastBet = amount};
    getLastBet = () => (this.lastBet);

    setHand = (hand) => this.hand = hand;
    getHand = () => (this.hand);

    setRole = (role) => this.role = role;
    getRole = () => (this.role);

    setShowHand = (status) => this.showHand = status;
    getHandStatus = () => (this.showHand);
 
}

module.exports = { RoomPlayer }
