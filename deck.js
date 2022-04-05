
class Card {
    constructor(suit, value) {
      this.suit = suit
      this.value = value
      }
  }

class Deck {

    constructor() {
        this.deck = [];
        this.shuffle();

}
//kortille tarpeelliset maa & arvo (S = pata, C = risti, D = ruutu, H = hertta)

    createDeck = () => {
        const suits = ["S", "C", "D", "H"]
        const values = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]

        for (let suit of suits) {
            for (let value of values) {
                this.deck.push(new Card(suit, value));
        }
    }
    return this.deck;
}
//korttipakan shuffle

shuffle = () => {
    let cardCounter = this.deck.length;
    let newValue, i;
    while (cardCounter) {
        i = Math.floor(Math.random() * counter--);
        newValue = this.deck[cardCounter];
        this.deck[cardCounter] = this.deck[i];
        this.deck[i] = newValue;
    }
    return this.deck;
}
    
        
//yksi kortti pakasta
getCard = () => {
    let getCard = this.deck.pop();
    return getCard;
}

//korttien jako, 2 korttia pakasta
dealCards = () => {
    let hand = [];
    while (2 > hand.length) {
        hand.push(this.deck.pop());
    }
    return hand;
}
}




