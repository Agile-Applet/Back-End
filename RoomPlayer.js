const { getHandPosition } = require('./utils/helpers');

class RoomPlayer extends Player {

    constructor(name, money, avatar, seatId, seatStatus, lastBet) {
        super(name,money,avatar);
        this.seatId = seatId;
        this.seatStatus = seatStatus;
        this.lastBet = 0;
        this.hand = [],
        this.showHand = true;
        this.handPosition = getHandPosition(seatId);
    }

}