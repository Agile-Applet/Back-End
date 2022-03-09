//kortille tarpeelliset maa & arvo (spade = pata, club = risti, diamond = ruutu, heart = hertta)
const suits = ["spades", "clubs", "diamonds", "hearts"]
const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

//pakan luokka
class Deck {
    constructor(cards = freshDeck()) {
    this.cards = cards
    }

//korttipakan koko shufflea varten
get amountOfCards() {
    return this.cards.length
    
}

//korttipakan sekoitus shufflella
shuffle() {
    for (let i = this.amountOfCards - 1; i > 0; i--) {
        const newIndex = Math.floor(Math.random() * (i + 1))
        const returnOld = this.cards[newIndex]
        this.cards[newIndex] = this.cards[i]
        this.cards[i] = [returnOld]
        
    }
  }
}

//yksittäisen kortin luokka
class Card {
  constructor(suit, value) {
    this.suit = suit
    this.value = value
    }
}

//jakaa sekoitetusta pakasta
function freshDeck() {
    return suits.flatMap(suit => {
        return values.map(value => {
            return new Card(suit, value)
        })
    })
}

//testi näkyykö kortit eri järjestyksissä
const deck = new Deck()
deck.shuffle()
console.log(deck.cards)

export { Deck,  Card, }
