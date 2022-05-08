const Hand = require('pokersolver').Hand;

/* Get random index number */
const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

/* Solve the winning hand */
const checkCards = (hands) => {
    let solvedHands = [];
    let oneHand = [];
    let winner;
    let players = [];

    hands.forEach(hand => {
        oneHand = [];
        if (hand.getStatus() === 2) {
            players.push(hand);
            hand.getPlayer().getHand().forEach(card => {
                oneHand.push(card.card);
            });
            solvedHands.push(Hand.solve(oneHand));

        }
    });

    winner = Hand.winners(solvedHands);

    console.log("winner");
    console.log(winner);

    solvedHands.forEach(hand => {
        if (winner[0] && hand.cards === winner[0].cards) {
            let winner_index = solvedHands.indexOf(hand);
            winner = players[winner_index].getId() + "=" + winner[0].descr;
        }
    });

    return winner;
};

module.exports = { getRandomInt, checkCards }
