
class Card {
    constructor(suit, value) {
      this.suit = suit
      this.value = value
      }
  }

class Deck {

    constructor() {
        this.deck = [];

}
//kortille tarpeelliset maa & arvo (S = pata, C = risti, D = ruutu, H = hertta)

    createDeck = () => {
        const suits = ["S", "C", "D", "H"]
        const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

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
oneCard = () => {
    let oneCard = this.deck.pop();
    return oneCard;
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

//Yksittäisen pelaajan luokka pelipöydässä
//(ID, Nimimerkki, jaettu käsi (2 korttia), käsi pöydän korttien kanssa, onko voittava käsi, rahat, paikka,
//edellinen bettaus, edellinen action (esim check), onko kierroksella dealer, call, raise, onko allin,
//kierroksella käytetty määrä, avatar kuvana

class Player {
    constructor() {
    this.playerId = playerId;
    this.playerName = playerName;
    this.hand = hand;
    this.handwithtable = handwithtable;
    this.bestHand = bestHand;
    this.money = money;
    this.chair = chair;
    this.bet = bet;
    this.action = action;
    this.dealer = false;
    this.call = call;
    this.raise = raise;
    this.allIn = false;
    this.betsThisRound = 0;
    this.avatar = avatar;
}
}

class Players {
//PelaajaT-luokka (pöydässä)
//tulee tiedot mitä pöytä tarvitsee pelaajasta
//(pelaajan id, nimimerkki, pelaajan käsi, rahatilanne, paikka, avatar)
//myös pelaajan istuutuminen, pelaajan lisääminen kiertoon yms

//Kierros-luokka: pelaajat kierroksella, pöytä, blindit, potti, stage=korttien jaot (ekat kolme, neljäs, viides)

}

class Round {
   
constructor() {
    this.players = [];
    this.table = [];
    this.bigBlind = 0;
    this.smallBlind = 0;
    this.pot = { cash: 0, players: [], id: '', sidePot: [] };
    this.stage = '';
    this.bets = false;
    this.restart = false;
}

addPlayers = (players) => {
    let newPlayer = [...players]
    this.players = newPlayer
}

startGame = (action) => {
    this.restart = action;
}

bigAndSmallBlind = (bigBlind, smallBlind) => {
    this.bigBlind = bigBlind;
    this.smallBlind = smallBlind;
}

//TODO: Käsien jako, stagen päivitys ja toimitus (flop, turn, river), kokonaisbetsin keräys, käden pelaaminen,
// voittavan käden tarkistaminen (arvot, kuningasvärisuora isoin & highcard pienin), potin voiton jakaminen, uuden kierroksen aloitus

}


