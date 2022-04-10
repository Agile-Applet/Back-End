const { Card } = require("../Card");
const { Round } = require("../Round");
const Hand = require('pokersolver').Hand;

let startDeck = [];
let hands = [];
let lastIndex = 0;

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
        while (5 > hand.length) {
            hand.push(startDeck[i]);
            i++;
        }
        hands.push(hand);
    }
    console.log(hands);
};

/* Remove taken cards from the deck */
const removeCards = (removedIndex) => {
    hands.splice(removedIndex, 1);
};

/* Deal starting cards */
const dealCards = (randomIndex, status) => {
    lastIndex = hands.length - 1;
    if (status === 'player') {
        return [{ card: hands[randomIndex][0].value + hands[randomIndex][0].suit }, { card: hands[randomIndex][1].value + hands[randomIndex][1].suit }];
    } else {
        return [{ card: hands[lastIndex][0].value + hands[lastIndex][0].suit }, { card: hands[lastIndex][1].value + hands[lastIndex][1].suit },
        { card: hands[lastIndex][2].value + hands[lastIndex][2].suit }, { card: hands[lastIndex][3].value + hands[lastIndex][3].suit }, { card: hands[lastIndex][4].value + hands[lastIndex][4].suit }];
    }
    console.log(hands);
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

module.exports = { createDeck, shuffle, removeCards, dealCards, checkCards }
