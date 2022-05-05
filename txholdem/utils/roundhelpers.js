const Hand = require('pokersolver').Hand;

/* Get random index number */
const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

/* Solve the winning hand */
const checkCards = (hands) => {
    let solvedHands = [];
    let oneHand = [];
    let winner = [];

    hands.forEach(hand => {
        oneHand = [];
        if (hand.getStatus() === 2) {
            hand.getPlayer().getHand().forEach(card => {
                oneHand.push(card.card);
            });
        }
        if (oneHand.length !== 0) {
            solvedHands.push(Hand.solve(oneHand));
        }
    });
    winner = Hand.winners(solvedHands);

    solvedHands.forEach(hand => {
        if (winner[0] && hand.cards === winner[0].cards) {
            winner = solvedHands.indexOf(hand);
        }
    });

    return winner;
};

module.exports = { getRandomInt, checkCards }
