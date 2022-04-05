/* Texas Holdem Round */
class Round {
    constructor() {
        players = [];
        table = [];
        bigBlind = 0;
        smallBlind = 0;
        pot = { cash: 0, players: [], id: '', sidePot: [] };
        stage = '';
        bets = false;
        restart = false;
    }

    addPlayers = (players) => {
        let newPlayer = [...players]
        players = newPlayer
    }

    startGame = (action) => {
        restart = action;
    }

    bigAndSmallBlind = (bigBlind, smallBlind) => {
        bigBlind = bigBlind;
        smallBlind = smallBlind;
    }
}

module.exports = { Round };
