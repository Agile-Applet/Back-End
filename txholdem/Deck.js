const { Card } = require("./Card");

class Deck {

    constructor() {
        this.deck = [];
        this.resetDeck();
        this.shuffle();
}
//kortille tarpeelliset maa & arvo (S = pata, C = risti, D = ruutu, H = hertta)

    resetDeck = () => {
        this.deck = [];
        const values = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
        const suits = ["s", "c", "d", "h"];
        const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

        for (let suit of suits) {
            for (let value of values) {
                this.deck.push(new Card(value, suit, ranks[values.indexOf(value)], value));
        }
    }
    this.shuffle();
    this.shuffle();
}
//korttipakan shuffle

    // https://bost.ocks.org/mike/shuffle/
    shuffle = () => {
        let m = this.deck.length, i;
        while (m) {
            i = Math.floor(Math.random() * m--);

            [this.deck[m], this.deck[i]] = [this.deck[i], this.deck[m]];
        }
        return this.deck;
    }
    
        
//yksi kortti pakasta
getCard = () => {
    let card = this.deck.pop();
    return {card : card.value + card.suit};
}

//korttien jako, 2 korttia pakasta
dealCards = (amount) => {
    let hand = [];
    for(let i = 0; i < amount; i++) {
        let card = this.deck.pop();
        hand[i] = {card : card.value + card.suit};
    }
 /*   while (amount > hand.length) {
        let thecard = this.deck.pop();
        hand.push(thecard);
    } */
    return hand;
}

}

module.exports = {Deck};