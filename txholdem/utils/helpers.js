/* Player Cards Helper. */
const rank = [2, 3, 4, 5, 6, 7, 8, 9, 'T', 'J', 'Q', 'K', 'A'];
const suit = ['c', 'd', 'h', 's']

/* Get random index number. */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/* Random cards tester */
function getRandomHand() {
    let card1 = rank[getRandomInt(12)] + suit[getRandomInt(3)];
    let card2 = rank[getRandomInt(12)] + suit[getRandomInt(3)];
    return [{ card: card1 }, { card: card2 }];
}

/* Hand Position Class Helper. */
const handPositions = ['player-cards-right', 'player-cards-left', 'player-cards-right', 'player-cards-left', 'player-cards-left', 'player-cards-right'];
getHandPosition = (seatId) => { return (handPositions[seatId - 1]) };

module.exports = { getRandomHand, getRandomInt, getHandPosition };
