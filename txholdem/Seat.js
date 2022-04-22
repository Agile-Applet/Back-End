//const { getHandPosition } = require('./utils/helpers');
const { RoomPlayer } = require("./RoomPlayer");

class Seat {

    constructor(id, status) {
        this.id = id;
        this.status = status;
        this.label = "Free";
        this.handPosition = "player-cards-right";
        this.player = new RoomPlayer(0, "Unknown", 0, "", null, id, 0, "")
    }

    getId = () => (this.id);
    setId = (id) => this.id(id);

    getStatus = () => (this.status);
    setStatus = (status) => this.status(status);

    getLabel = () => (this.label);
    setLabel = (label) => this.status(label);

    getPlayer = () => (this.player);
    setPlayer = (player) => this.player(player);

    resetSeat = () => {
        this.status = 0;
        this.status = "Free";
        this.player = new RoomPlayer(0, "Unknown", 0, "", null, id, 0, "")
    }

}

module.exports = { Seat }