/* Texas Holdem Game Room implemented with Socket.io. */
const { getRandomInt } = require("./utils/helpers");
const { addUser, updateUser, getUser, deleteUser } = require("../user/users");
const { Controller } = require("./Controller");
const { createDeck } = require("./utils/roundhelpers");
const { depositGameFunds } = require("../txholdem/utils/depositGameFunds");

const avatars = [
  'https://content-eu.invisioncic.com/b310290/monthly_2017_04/Nikolay-Kostyrko_Time1491772457527.jpg.2d6ef3b3f499abd15f631f55bbc2aba5.jpg',
  'https://pickaface.net/gallery/avatar/MsMattheis54086b03941f8.png',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjgQWa7pOSm_kU8Hx4j2V3ebQYfkBkBDehcMbKqEZEUuh2LE4OELW8lG0nYs1P7O6fii4&usqp=CAU',
  'https://pickaface.net/gallery/avatar/unr_padreirene_180720_1215_wuaaj.png',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRlZRhdBjXKq_kKjZ7Gx9kom1sBkk0WYFQPchjkcNFbmijoVoKXlq0dypJPthCmHx6BHc&usqp=CAU',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ2p__fecPLO2nG02fp9yax0tlWFcjCQgNwg&usqp=CAU'
];

class Room {

  constructor(io, uri, name, description, minBuy, maxBuy) {

    this.name = name;
    this.description = description;
    this.uri = uri;
    this.minBuy = minBuy;
    this.maxBuy = maxBuy;

    this.players = 0;
    this.maxPlayers = 6;
    this.socket = null;

    /* Player Array */
    this.playerData = [
      { playerId: 0, playerName: 'Free', seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: false, handPosition: 'player-cards-right', avatar: '', role: '' },
      { playerId: 1, playerName: 'Free', seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: true, handPosition: 'player-cards-left', avatar: '', role: '' },
      { playerId: 2, playerName: 'Free', seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: true, handPosition: 'player-cards-left', avatar: '', role: '' },
      { playerId: 3, playerName: 'Free', seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: true, handPosition: 'player-cards-left', avatar: '', role: '' },
      { playerId: 4, playerName: 'Free', seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: true, handPosition: 'player-cards-right', avatar: '', role: '' },
      { playerId: 5, playerName: 'Free', seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: true, handPosition: 'player-cards-right', avatar: '', role: '' }
    ];

    /* Listening room, controller */
    this.room = io.of('/' + uri);
    this.listenRoom();
    this.controller = new Controller(this, this.room); // Game Controller (Texas Holdem Logic & Rules)
  }

  /* Getters */
  getPlayerData = () => (this.playerData);
  getPlayerCount = () => (this.players);

  /* Setters */
  setPlayerData = (data) => this.playerData(data);

  /* Listen Specific Room */
  listenRoom() {
    this.room.on('connection', (socket) => {
      console.log("[Holdem-Socket] User connected : " + socket.id);
      socket.on('disconnect', () => {
        console.log("[Holdem-Socket] User disconnected");
        const usr = getUser(socket.id);
        const user = deleteUser(socket.id);
        if (user) {
          if (this.playerData[usr.seat].seatStatus != 0) {
            this.players--;
            console.log("[Holdem-Socket] Current players: " + this.players + " of " + this.maxPlayers);
          }
          this.playerData[usr.seat] = { ...this.playerData[usr.seat], playerName: 'Free', seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: false, avatar: '', role: '' };
          this.room.in(user.room).emit('updatePlayer', this.playerData);
          if (this.players === 0) {
            this.room.in(user.room).emit('updateTableCards', [{ pot: 0.00, cards: [0], status: null }]);
            this.room.in(user.room).emit('startGame', false);
            this.playerData.forEach(player => {
              this.playerData[this.playerData.indexOf(player)] = { ...this.playerData[this.playerData.indexOf(player)], playerName: 'Free', seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: false, avatar: '', role: '' };
            });
            this.room.in(user.room).emit('updatePlayer', this.playerData);
          }
        }
      });

      /* Join Rooms (as a spectator) */
      socket.on('join_room', (data) => {
        const { user, error } = addUser(socket.id, data.name, 0, data.room);
        socket.join(data.room);
        this.room.in(data.room).emit('updatePlayer', this.playerData);
      });

      /* Game Seating */

      /* Joining Free Seat */
      socket.on('join_seat', (data) => {
        if (this.players <= this.maxPlayers) {
          let seat = data.seatId;
          if (this.playerData[seat].seatStatus === 0) {
            console.log("[Holdem-Socket]");
            const user = getUser(socket.id);
            if (user.seat && user.seat != 0) {
              return socket.emit('userError', { action: 'join_seat', status: 'failed', message: "Olet jo toisella pöytäpaikalla." });
            }
            this.players++;
            updateUser(user.name, seat, user.room);
            this.playerData[seat] = { ...this.playerData[seat], playerName: user.name, seatStatus: 1, money: data.amount, lastBet: 0, hand: "", showHand: false, avatar: avatars[getRandomInt(5)], role: '' };
            if (this.players === 1) {
              createDeck();
            } else if (this.players === 2) {
              this.controller.startGame(this.playerData);
            }
            this.room.in(user.room).emit('updatePlayer', this.playerData);
            console.log("[Holdem-Socket] Current players: " + this.players + " of " + this.maxPlayers);
          } else {
            console.log("[Holdem-Socket] Seat is already taken.");
            return socket.emit('userError', { action: 'join_seat', status: 'failed', message: "Valitsemasi pöytäpaikka on jo varattu toiselle pelaajalle." });
          }
        } else {
          console.log("[Holdem-Socket] Player is not authorized to join right now.");
          return socket.emit('userError', { action: 'join_seat', status: 'failed', message: "Et voi liittyä tällä hetkellä." });
        }
      });

      /* Leaving Seat */
      socket.on('leave_seat', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;
        if (this.controller.gameStatus === 'Pause') {
          this.playerData[seat] = { ...this.playerData[seat], playerName: 'Free', seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: false, avatar: '', role: '' };
          updateUser(user.name, 0, user.room);
          this.players--;
          console.log("[Holdem-Socket] Current players: " + this.players + " of " + this.maxPlayers);
          this.room.in(user.room).emit('updatePlayer', this.playerData);
        } else {
          console.log("[Leave] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: 'leave_seat', status: 'failed', message: "Et voi tällä hetkellä poistua paikaltasi." });
        }
        if (this.players === 0) {
          this.room.in(user.room).emit('updateTableCards', [{ pot: 0.00, cards: [0], status: null }]);
          this.room.in(user.room).emit('startGame', false);
          this.playerData.forEach(player => {
            this.playerData[this.playerData.indexOf(player)] = { ...this.playerData[this.playerData.indexOf(player)], playerName: 'Free', seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: false, avatar: '', role: '' };
          });
          this.room.in(user.room).emit('updatePlayer', this.playerData);
        }
      });

      /* Bet, Fold, Check */
      socket.on('fold_hand', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;
        if (seat == this.controller.playerTurn()) {
          this.playerData[seat] = { ...this.playerData[user.seat], hand: [], showHand: false };
          this.room.in(user.room).emit('updatePlayer', this.playerData);
        } else {
          console.log("[Fold] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: 'fold_hand', status: 'failed', message: "Et voi tällä hetkellä luovuttaa kättä." });
        }
      });

      socket.on('check_hand', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;
        if (seat == this.controller.playerTurn()) {
          this.controller.playerTurn(1);
        } else {
          console.log("[Fold] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: 'check', status: 'failed', message: "Et voi tällä hetkellä ohittaa vuoroasi." });
        }
      });

      socket.on('bet_hand', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;
        if (seat == this.controller.playerTurn()) {
          const bet = this.playerData[user.seat].lastBet + data.betAmount;
          this.playerData[user.seat] = { ...this.playerData[user.seat], lastBet: bet, showHand: false };
          this.room.in(user.room).emit('updatePlayer', this.playerData);
        } else {
          console.log("[Bet] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: 'bet_hand', status: 'failed', message: "Et voi tällä hetkellä korottaa panosta." });
        }
      });
    });
  };
}

module.exports = { Room }
