/* Validate player actions. */
let turn = 6;

function playerTurn() {
    return turn;
}

function setPlayerTurn(data) {
    turn = data;
}

module.exports = { playerTurn, setPlayerTurn };
