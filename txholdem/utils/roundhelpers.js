const { Card } = require("../Card");
const { Round } = require("../Round");
const { getRandomInt } = require("../utils/helpers");
const Hand = require('pokersolver').Hand;

let startDeck = [];
let hands = [];

/* Create a new deck */
const createDeck = () => {
    const values = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
    const suits = ["s", "c", "d", "h"];
    const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    startDeck = [];

    values.forEach(value => {
        suits.forEach(suit => {
            startDeck.push(new Card(value, suit, ranks[values.indexOf(value)], value));
        })
    })
    shuffle(startDeck);
};

/* Shuffle the deck */
const shuffle = (deck) => {
    let hand = [];
    let currentIndex = deck.length, randomIndex;
    let i = 0;
    hands = [];

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [deck[currentIndex], deck[randomIndex]] = [
            deck[randomIndex], deck[currentIndex]];
    }
    while (7 > hands.length) {
        hand = [];
        while (2 > hand.length) {
            hand.push(startDeck[i]);
            i++;
        }
        hands.push(hand);
    }
};

/* Remove taken cards from the deck */
const removeCards = (removedIndex) => {
    startDeck.splice(startDeck.indexOf(hands[removedIndex][0]), 2);
    hands.splice(removedIndex, 1);

    console.log(startDeck);
    console.log(hands);
};

/* Pick one card from the deck */
const oneCard = () => {
    const oneCard = startDeck[getRandomInt(51)];
    return oneCard;
};

/* Deal starting cards */
const dealCards = (randomIndex) => {
    return [{ card: hands[randomIndex][0].value + hands[randomIndex][0].suit }, { card: hands[randomIndex][1].value + hands[randomIndex][1].suit }];
};

/* Solve the winning hand */
const checkCards = (hands) => {
    let solvedHands = [];
    let oneHand = [];
    let winner = [];

    hands.forEach(hand => {
        oneHand = [];
        hand.forEach(card => {
            oneHand.push(card.card);
        });
        if (oneHand.length !== 0) {
            solvedHands.push(Hand.solve(oneHand));
        }
    });

    winner = Hand.winners(solvedHands);

    /*
    solvedHands.forEach(hand => {
        if (winner[0] && hand.cards === winner[0].cards) {
            winner = solvedHands.indexOf(hand);
        }
    });
    //return winner;*/
    console.log(winner);
};

module.exports = { createDeck, shuffle, removeCards, oneCard, dealCards, checkCards }
