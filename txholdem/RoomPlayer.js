/* Texas Holdem Player */
const { Player } = require("./Player");

class RoomPlayer extends Player {

    // Private attributes
    #hand = [];
    #socketId;

    constructor(id, name, money, avatar, socketId, seatId, role) {
        super(id, name, money, avatar);
        this.#socketId = socketId;
        this.seatId = seatId;
        this.betAmount = 0;
        this.lastBet = 0;
        this.showHand = false;
        this.role = role;
    }

    getSocketId() { return this.#socketId };

    setSeat = (seatId) => this.seatId = seatId;
    getSeat = () => (this.seatId);

    setBetAmount = (amount) => { this.betAmount += amount };
    getBetAmount = () => (this.betAmount);

    setLastBet = (amount) => { this.lastBet = amount };
    getLastBet = () => (this.lastBet);

    setHand = (hand) => this.#hand = hand;
    getHand() { return this.#hand };

    setRole = (role) => this.role = role;
    getRole = () => (this.role);

    setShowHand = (status) => this.showHand = status;
    getHandStatus = () => (this.showHand);

}

module.exports = { RoomPlayer }
