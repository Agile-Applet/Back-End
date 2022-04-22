/* Texas Holdem Game Room implemented with Socket.io. */
const { getRandomInt } = require("./utils/helpers");
const { addUser, updateUser, getUser, deleteUser } = require("../user/users");
const { Controller } = require("./Controller");
const { depositGameFunds } = require("../txholdem/utils/depositGameFunds");
const { Deck } = require("./Deck");
const { Seat } = require("./Seat");
const { RoomPlayer } = require("./RoomPlayer");

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

    /* Room Data, replaces the old playerData */

    this.roomData = [];
    for (let i=0; i <= 5; i++) {
      let seat = new Seat(i, 0);
      this.roomData.push(seat);
    }

    console.log(this.roomData);

    /* Listening room, controller */
    this.room = io.of('/' + uri);
    this.listenRoom();
    this.controller = new Controller(this, this.room); // Game Controller (Texas Holdem Logic & Rules)
  }

  /* Getters */
  getPlayerData = () => (this.playerData);
  getPlayerCount = () => (this.players);
  getRoomData = () => (this.roomData);

  /* Setters */
  setPlayerData = (data) => this.playerData(data);
  setRoomData = (data) => this.roomData(data);

  /* Listen Specific Room */
  listenRoom() {
    this.room.on('connection', (socket) => {
      console.log("[Connect] User connected : " + socket.id);
      socket.on('disconnect', () => {
        console.log("[Disconnect] User disconnected");
        const usr = getUser(socket.id);
        const user = deleteUser(socket.id);
        if (user) {
          if (this.roomData[usr.seat].status != 0) {
            this.players--;
            console.log("[Disconnect] Current players: " + this.players + " of " + this.maxPlayers);
          }
          this.roomData[usr.seat].resetSeat();
          this.room.in(user.room).emit('updatePlayer', this.roomData);
          if (this.players === 0) {
            this.room.in(user.room).emit('updateTableCards', [{ pot: 0.00, cards: [0], status: null }]);
            this.room.in(user.room).emit('syncGame', false);
            this.roomData.forEach(seat => {
              this.roomData[this.roomData.indexOf(seat)].resetSeat();
            });
            this.room.in(user.room).emit('updatePlayer', this.roomData);
          }
        }
      });

      /* Join Rooms (as a spectator) */
      socket.on('join_room', (data) => {
        const { user, error } = addUser(socket.id, data.name, 0, data.room);
        socket.join(data.room);
        this.room.in(data.room).emit('updatePlayer', this.roomData);
      });

      /* Game Seating */

      /* Joining Free Seat */
      socket.on('join_seat', (data) => {
        if (this.players <= this.maxPlayers) {
          let seat = data.seatId;
          if (this.roomData[seat].status === 0) {
            const user = getUser(socket.id);
            if (user.seat && user.seat != 0) {
              return socket.emit('userError', { action: 'join_seat', status: 'failed', message: "Olet jo toisella pöytäpaikalla." });
            }
            this.players++;
            updateUser(user.name, seat, user.room);
            this.roomData[seat].setPlayer(new RoomPlayer(seat, user.name, data.amount, avatars[getRandomInt(5)], socket.id, seat, null));
            if (this.players === 1) {
            } else if (this.players === 2) {
              this.controller.startGame(this.roomData);
            }
            this.room.in(user.room).emit('updatePlayer', this.roomData);
            console.log("[Join] Current players: " + this.players + " of " + this.maxPlayers);
          } else {
            console.log("[Join] Seat is already taken.");
            return socket.emit('userError', { action: 'join_seat', status: 'failed', message: "Valitsemasi pöytäpaikka on jo varattu toiselle pelaajalle." });
          }
        } else {
          console.log("[Join] Player is not authorized to join right now.");
          return socket.emit('userError', { action: 'join_seat', status: 'failed', message: "Et voi liittyä tällä hetkellä." });
        }
      });

      /* Leaving Seat */
      socket.on('leave_seat', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;
        if (1 == 1) {
          this.roomData[seat].resetSeat();
          updateUser(user.name, 0, user.room);
          this.players--;
          console.log("[Leave] Current players: " + this.players + " of " + this.maxPlayers);
          this.room.in(user.room).emit('updatePlayer', this.roomData);
        } else {
          console.log("[Leave] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: 'leave_seat', status: 'failed', message: "Et voi tällä hetkellä poistua paikaltasi." });
        }
        if (this.players === 0) {
          this.room.in(user.room).emit('updateTableCards', [{ pot: 0.00, cards: [0], status: null }]);
          this.room.in(user.room).emit('syncGame', false);
          this.roomData.forEach(player => {
            this.roomData[this.roomData.indexOf(player)].resetSeat();
          });
          this.room.in(user.room).emit('updatePlayer', this.roomData);
        }
      });

      /* Bet, Fold, Check */
      socket.on('fold_hand', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;
        if (seat == this.controller.getPlayerTurn()) {
          this.roomData[seat].getPlayer().setShowHand(false);
          this.room.in(user.room).emit('updatePlayer', this.roomData);
        } else {
          console.log("[Fold] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: 'fold_hand', status: 'failed', message: "Et voi tällä hetkellä luovuttaa kättä." });
        }
      });

      socket.on('check_hand', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;
        if (seat == this.controller.getPlayerTurn()) {
          this.controller.setPlayerTurn(1);
        } else {
          console.log("[Fold] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: 'check', status: 'failed', message: "Et voi tällä hetkellä ohittaa vuoroasi." });
        }
      });

      socket.on('bet_hand', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;
        if (seat == this.controller.getPlayerTurn()) {
          const bet = this.roomData[user.seat].getPlayer().lastBet + data.betAmount;
          if (this.roomData[user.seat].getPlayer().getMoney() >= data.betAmount) {
            if (this.controller.checkBet(bet, parseFloat(seat))) {
              this.roomData[user.seat].getPlayer().deductMoney(data.betAmount);
              this.room.in(user.room).emit('updatePlayer', this.roomData);
            }
          } else {
            console.log("[Bet] Wrong amount.");
            return socket.emit('userError', { action: 'bet_hand', status: 'failed', message: "Tarkista panostus." });
          }
        } else {
          console.log("[Bet] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: 'bet_hand', status: 'failed', message: "Et voi tällä hetkellä korottaa panosta." });
        }
      });
    });
  };
}

module.exports = { Room }
