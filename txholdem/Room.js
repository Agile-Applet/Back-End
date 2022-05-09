/* Texas Holdem Game Room implemented with Socket.io. */
const { getRandomInt } = require("./utils/roundhelpers");
const { addUser, updateUser, getUser, deleteUser } = require("../user/users");
const { Controller } = require("./Controller");
const { depositGameFunds } = require("../txholdem/utils/depositGameFunds");
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

    /* Room Data, replaces the old playerData */
    this.roomData = [];
    for (let i = 0; i <= 5; i++) {
      let seat = new Seat(i, 0);
      this.roomData.push(seat);
    }

    /* Listening room, controller */
    this.room = io.of('/' + uri);
    this.listenRoom();
    this.controller = new Controller(this, this.room); // Game Controller (Texas Holdem Logic & Rules)
  }

  /* Getters */
  getPlayerCount = () => (this.players);
  getRoomData = () => (this.roomData);

  /* Setters */
  setRoomData = (data) => this.roomData(data);

  /* Listen Specific Room */
  listenRoom() {
    this.room.on('connection', (socket) => {
      console.log("[Connect] User connected : " + socket.id);
      socket.on('disconnect', () => {
        console.log("[Disconnect] User disconnected");
        const user = getUser(socket.id);
        const delUser = deleteUser(socket.id);
        if (delUser) {
          if (this.roomData[user.seat].status != 0) {
            this.players--;
            console.log("[Disconnect] Current players: " + this.getPlayerCount() + " of " + this.maxPlayers);
          }
          this.roomData[user.seat].resetSeat();
          this.room.in(delUser.room).emit('updatePlayer', this.roomData);
          if (this.getPlayerCount() === 0) {
            this.room.in(delUser.room).emit('updateTableCards', [{ pot: 0.00, cards: [0], status: null }]);
            this.room.in(delUser.room).emit('syncGame', false);
            this.roomData.forEach(seat => {
              this.roomData[this.roomData.indexOf(seat)].resetSeat();
            });
            this.room.in(delUser.room).emit('updatePlayer', this.roomData);
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
        if (this.getPlayerCount() <= this.maxPlayers) {
          let seat = data.seatId;
          if (this.roomData[seat].status === 0) {
            const user = getUser(socket.id);
            // Threw error when more than one window open with same user
            if (typeof (user) === 'undefined') return socket.emit('userError', { action: 'join_seat', status: 'failed', message: "Et voi liittyä tällä hetkellä." });

            if (user.seat && user.seat != 0) {
              return socket.emit('userError', { action: 'join_seat', status: 'failed', message: "Olet jo toisella pöytäpaikalla." });
            }
            this.players++;
            updateUser(user.name, seat, user.room);
            this.roomData[seat].reserveSeat(user.name);
            this.roomData[seat].setPlayer(new RoomPlayer(seat, user.name, data.amount, avatars[getRandomInt(5)], socket.id, seat, 0, ""));
            if (this.getPlayerCount() === 1) {
            } else if (this.getPlayerCount() === 2) {
              this.controller.startGame(this.roomData);
            }
            this.room.in(user.room).emit('updatePlayer', this.roomData);
            console.log("[Join] Current players: " + this.getPlayerCount() + " of " + this.maxPlayers);
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
          console.log("[Leave] Current players: " + this.getPlayerCount() + " of " + this.maxPlayers);
          this.room.in(user.room).emit('updatePlayer', this.roomData);
        } else {
          console.log("[Leave] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: 'leave_seat', status: 'failed', message: "Et voi tällä hetkellä poistua paikaltasi." });
        }
        if (this.getPlayerCount() === 0) {
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
          this.controller.handleFold(this.roomData[seat]);
          this.room.in(user.room).emit('updatePlayer', this.roomData);
        } else {
          console.log("[Fold] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: 'fold_hand', status: 'failed', message: "Et ole tällä hetkellä vuorossa." });
        }
      });

      socket.on('check_hand', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;

        if (seat == this.controller.getPlayerTurn()) {
          if (this.controller.currentBet !== 0) { // TBD: if player is poor = all-in
            let reduceAmount = this.controller.currentBet - this.roomData[seat].getPlayer().getLastBet() 
            this.roomData[seat].getPlayer().deductMoney(reduceAmount);
            this.roomData[seat].getPlayer().setLastBet(this.controller.currentBet);
            this.controller.handleCheck();
          }else{
            this.controller.handleCheck();
          }
        } else {
          console.log("[Check] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: 'check', status: 'failed', message: "Et ole tällä hetkellä vuorossa." });
        }
      });

      socket.on('bet_hand', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;
        if (seat == this.controller.getPlayerTurn()) {
          const bet = this.roomData[seat].getPlayer().lastBet + data.betAmount;
          if (this.roomData[seat].getPlayer().getMoney() >= data.betAmount) {
            if (this.controller.checkBet(bet, parseInt(seat))) {
              this.roomData[seat].getPlayer().deductMoney(data.betAmount);
              this.roomData[seat].getPlayer().setBetAmount(data.betAmount);
              this.room.in(user.room).emit('updatePlayer', this.roomData);
            }
          } else {
            console.log("[Bet] Wrong amount.");
            return socket.emit('userError', { action: 'bet_hand', status: 'failed', message: "Tarkista panostus." });
          }
        } else {
          console.log("[Bet] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: 'bet_hand', status: 'failed', message: "Et ole tällä hetkellä vuorossa." });
        }
      });
    });
  };
}

module.exports = { Room }
