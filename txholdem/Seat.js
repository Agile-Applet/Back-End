const { RoomPlayer } = require("./RoomPlayer");

class Seat {

    constructor(id, status) {
        this.id = id;
        this.status = status; // 0 = free, 1 = waiting, 2 = playing
        this.label = "Free";
        this.player = new RoomPlayer(0, "Tuntematon", 0, "", "", id, 0, "")
        this.hasTurn = false;
    }

    getId = () => (this.id);
    setId = (id) => this.id = id;

    getStatus = () => (this.status);
    setStatus = (status) => this.status = status;

    getLabel = () => (this.label);
    setLabel = (label) => this.label = label;

    getPlayer = () => (this.player);
    setPlayer = (player) => this.player = player;

    setTurn = (bool) => this.hasTurn = bool;

    reserveSeat = (playerName) => {
        this.label = playerName;
        this.status = 1;
    }

    resetSeat = () => {
        this.label = 'Free';
        this.status = 0;
        this.player = new RoomPlayer(0, "Tuntematon", 0, "", "", this.id, 0, "")
    }

}

module.exports = { Seat }