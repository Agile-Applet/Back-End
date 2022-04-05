const { Card } = require("../Card");
const { Round } = require("../Round");
const Hand = require('pokersolver').Hand;

let startDeck = [];

/* Create a new deck */
const createDeck = () => {
    const values = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
    const suits = ["s", "c", "d", "h"];
    const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    values.forEach(value => {
        suits.forEach(suit => {
            startDeck.push(new Card(value, suit, ranks[values.indexOf(value)], value));
        })
    })
    return startDeck;
};

/* Shuffle the deck */
const shuffle = (deck) => {
    let currentIndex = deck.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [deck[currentIndex], deck[randomIndex]] = [
            deck[randomIndex], deck[currentIndex]];
    }
    return deck;
};

/* Pick one card from deck */
const oneCard = (deck) => {
    let oneCard = deck.pop();
    return oneCard;
};

/* Deal the deck */
const dealCards = (deck, cardCount, playerCount) => {
    let hand = [];
    let hands = [];

    while (playerCount > hands.length) {
        hand = [];
        while (cardCount > hand.length) {
            hand.push(deck.pop().value + deck.pop().suit);
        }
        hands.push(hand);
    }
    return hands;
};

/* Solve the winning hand */
const CheckCards = (hands) => {
    const solvedHands = [];

    hands.forEach(hand => {
        solvedHands.push(Hand.solve(hand));
    });

    const winner = Hand.winners(solvedHands);

    return winner;
};

module.exports = { createDeck, shuffle, oneCard, dealCards, CheckCards }
