/* Texas Holdem Game Room implemented with Socket.io. */
const { getRandomHand, getRandomInt } = require("./utils/helpers");
const { playerTurn, setPlayerTurn } = require("./utils/validation");
const { addUser, updateUser, getUser, deleteUser, getUsers } = require('../user/users');
const { Player } = require("./Player");
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

    this.boardData = [
    ]

    this.playerData = [
      { playerId: 1, playerName: "Pelaaja 1", seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: false, handPosition: 'player-cards-right', avatar: '' },
      { playerId: 2, playerName: "Pelaaja 2", seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: true, handPosition: 'player-cards-left', avatar: '' },
      { playerId: 3, playerName: "Pelaaja 3", seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: true, handPosition: 'player-cards-right', avatar: '' },
      { playerId: 4, playerName: "Pelaaja 4", seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: true, handPosition: 'player-cards-left', avatar: '' },
      { playerId: 5, playerName: "Pelaaja 5", seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: true, handPosition: 'player-cards-left', avatar: '' },
      { playerId: 6, playerName: "Pelaaja 6", seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: true, handPosition: 'player-cards-right', avatar: '' }
    ];

    this.room = io.of('/' + uri);
    this.listenRoom();
  }

  /* Listen Specific Room */
  listenRoom() {
    this.room.on('connection', (socket) => {

      console.log("[Holdem-Socket] User connected : " + socket.id);

      socket.on("disconnect", () => {
        console.log("[Holdem-Socket] User disconnected");
        const usr = getUser(socket.id);
        const user = deleteUser(socket.id);
        if (user) {
          if (this.playerData[usr.seat].seatStatus != 0) {
            this.players--;
            console.log("[Holdem-Socket] Current players: " + this.players + " of " + this.maxPlayers);
          }
          this.playerData[usr.seat] = { ...this.playerData[usr.seat], playerName: "Free Seat", seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: false, avatar: '' };
          this.room.in(user.room).emit('updateTable', this.playerData);
        }
      })

      /* Join Rooms (as a spectator) */
      socket.on('join_room', (data) => {
        /* Uuden luokan testikäyttö */
        this.boardData.push(new RoomPlayer(data.name, 0, avatars[getRandomInt(5)], socket.id, 0, 0));
        console.log(this.boardData[0]);
        /* Vanhalla jatkuu */
        const { user, error } = addUser(socket.id, data.name, 0, data.room);
        socket.join(data.room);
        this.room.in(data.room).emit('updateTable', this.playerData);
      })

      /* Game Seating */

      /* Joining Free Seat */
      socket.on('join_seat', (data) => {
        if (this.players < this.maxPlayers) {
          let seat = data.seatId - 1;
          if (this.playerData[seat].seatStatus == 0) {
            console.log("[Holdem-Socket] " + data);
            const user = getUser(socket.id);
            if (user.seat && user.seat != 0) {
              return socket.emit('userError', { action: "join_seat", status: "failed", message: "Olet jo toisella pöytäpaikalla." });
            }
            this.players++;
            updateUser(user.name, seat, user.room);
            this.playerData[data.seatId - 1] = { ...this.playerData[seat], playerName: user.name, seatStatus: 1, money: data.amount, lastBet: 0, hand: getRandomHand(), showHand: false, avatar: avatars[getRandomInt(5)] };
            this.room.in(user.room).emit('updateTable', this.playerData);
            console.log("[Holdem-Socket] Current players: " + this.players + " of " + this.maxPlayers);
          } else {
            console.log("[Holdem-Socket] Seat is already taken.");
            return socket.emit('userError', { action: "join_seat", status: "failed", message: "Valitsemasi pöytäpaikka on jo varattu toiselle pelaajalle." });
          }
        } else {
          console.log("[Holdem-Socket] Room has maximum amount of players.");
          return socket.emit('userError', { action: "join_seat", status: "failed", message: "Pöydässä on jo maksimi määrä pelaajia." });
        }
      })

      /* Leaving Seat */
      socket.on('leave_seat', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;
        if (playerTurn() === 6) {
          this.playerData[seat] = { ...this.playerData[seat], playerName: "Free Seat", seatStatus: 0, money: 0, lastBet: 0, hand: [], showHand: false, avatar: '' };
          updateUser(user.name, 0, user.room);
          this.players--;
          console.log("[Holdem-Socket] Current players: " + this.players + " of " + this.maxPlayers);
          this.room.in(user.room).emit('updateTable', this.playerData);
        } else {
          console.log("[Leave] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: "leave_seat", status: "failed", message: "Et voi tällä hetkellä poistua paikaltasi." });
        }
      })

      /* Bet, Fold, Check */
      socket.on('fold_hand', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;
        if (playerTurn() === seat) {
          this.playerData[seat] = { ...this.playerData[user.seat], hand: [], showHand: false };
          this.room.in(user.room).emit('updateTable', this.playerData);
          // Next user && turn to be implemented
        } else {
          console.log("[Fold] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: "fold_hand", status: "failed", message: "Et voi tällä hetkellä luovuttaa kättä." });
        }
      })

      socket.on('check_hand', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;
        setPlayerTurn(seat);
        // user checks & next user & turn to be implemented
      })

      socket.on('bet_hand', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;
        if (playerTurn() === seat) {
          const bet = this.playerData[user.seat].lastBet + data.betAmount;
          this.playerData[user.seat] = { ...this.playerData[user.seat], lastBet: bet, showHand: false };
          this.room.in(user.room).emit('updateTable', this.playerData);
          // next user & turn to be implemented
        } else {
          console.log("[Bet] Player is not authorized to execute this action right now.");
          return socket.emit('userError', { action: "bet_hand", status: "failed", message: "Et voi tällä hetkellä korottaa panosta." });
        }
      })

    })
  }
}

module.exports = { Room }
