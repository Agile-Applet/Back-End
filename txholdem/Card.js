/* Texas Holdem Card */
class Card {
    constructor(value, suit, rank, wildValue) {
        this.value = value;
        this.suit = suit;
        this.rank = rank;
        this.wildValue = wildValue;
    }
}

module.exports = { Card };
