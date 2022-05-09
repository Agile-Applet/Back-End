const Hand = require('pokersolver').Hand;

/* Get random index number */
const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

/* Solve the winning hand */
const checkCards = (hands) => {
    let solvedHands = [];
    let oneHand = [];
    let winners;
    let winner_info = [];
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

    winners = Hand.winners(solvedHands);

    winners.forEach(winner => {
        solvedHands.forEach(hand => {
            if (hand.cards === winner.cards) {
                let winner_index = solvedHands.indexOf(hand);
                winner_info.push(players[winner_index].getId() + "=" + winner.descr);
            }
        });
    });
    return winner_info;
};

module.exports = { getRandomInt, checkCards }
