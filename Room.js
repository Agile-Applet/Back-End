/* Texas Holdem Game Room implemented with Socket.io */

const { getRandomHand, getRandomInt  } = require("./utils/helpers");
const { addUser, updateUser, getUser, deleteUser, getUsers } = require('./users');

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

        this.tableData = {
            name : "Pöytä 1",
            players : 0,
            maxPlayers : 6,
            currentTurn : 0,
            socketId : null,
        }

        this.playerData = [
            {playerId: 1, playerName : "Pelaaja 1", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand: false, handPosition: 'player-cards-right', avatar: ''},
            {playerId : 2, playerName : "Pelaaja 2", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand : true, handPosition: 'player-cards-left', avatar: ''},
            {playerId : 3, playerName : "Pelaaja 3", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand : true, handPosition: 'player-cards-right', avatar: ''},
            {playerId : 4, playerName : "Pelaaja 4", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand : true, handPosition: 'player-cards-left', avatar: ''},
            {playerId : 5, playerName : "Pelaaja 5", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand : true, handPosition: 'player-cards-left', avatar: ''},
            {playerId : 6, playerName : "Pelaaja 6", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand : true, handPosition: 'player-cards-right', avatar: ''}
        ];

        this.room = io.of('/' + uri);
        this.listenRoom();
    }

    /* Listen Specific Room */

    listenRoom() {
        this.room.on('connection', (socket) => {
        
          console.log("User connected : " + socket.id);

        socket.on("disconnect", () => {
            console.log("User disconnected");
            const usr = getUser(socket.id);
            this.playerData[usr.seat] = {...this.playerData[usr.seat], playerName : "Free Seat", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand: false, avatar: ''};
            const user = deleteUser(socket.id)
            this.tableData.players--;
            console.log("Current players: " + this.tableData.players + " of " + this.tableData.maxPlayers);
            if (user) {
              /*this.room.in(user.room).emit('notification', { title: 'Someone just left', description: `${user.name} just left the room` })
              this.room.in(user.room).emit('users', getUsers(user.room))*/
              this.room.in(user.room).emit('updateTable', this.playerData);
            }
        })


        /* Join Rooms (as a spectator) */

        socket.on('join_room', (data) => {
        const { user, error } = addUser(socket.id, data.name, 0, data.room)
        socket.join(data.room)
       /*this.room.in(data.room).emit('notification', {test: "123", title : "Test", description : "asd"});
        this.room.in(data.room).emit('users', getUsers(data.room))
        console.log(data);
        */
        this.room.in(data.room).emit('updateTable', this.playerData);
    })

    /* Game Seating */

    /* Joining Free Seat */

    socket.on('join_seat', (data) => {
      if ( this.tableData.players < this.tableData.maxPlayers ) {
        let seat = data.seatId-1;
        if ( this.playerData[seat].seatStatus == 0 ) {
          console.log(data);
          const user = getUser(socket.id);
          if ( user.seat && user.seat != 0 ) {
            return socket.emit('userError', {action: "join_seat", status: "failed", message: "Olet jo toisella pöytäpaikalla."})
          }
          this.tableData.players++;
          updateUser(user.name, seat, user.room);
          this.playerData[data.seatId-1] = {...this.playerData[seat], playerName : user.name, seatStatus: 1, money: data.amount, lastBet: 0, hand : getRandomHand(), showHand: false, avatar: avatars[getRandomInt(5)]};
          this.room.in(user.room).emit('updateTable', this.playerData);
          console.log("Current players: " + this.tableData.players + " of " + this.tableData.maxPlayers);
        } else {
          console.log("Seat is already taken.");
          return socket.emit('userError', {action: "join_seat", status: "failed", message: "Valitsemasi pöytäpaikka on jo varattu toiselle pelaajalle."})
        }
      } else {
        console.log("Room has maximum amount of players.");
        return socket.emit('userError', {action: "join_seat", status: "failed", message: "Pöydässä on jo maksimi määrä pelaajia."})
      }
    })

    /* Leaving Seat */

    socket.on('leave_seat', (data) => {
      const user = getUser(socket.id);
      let seat = user.seat;
      this.playerData[seat] = {...this.playerData[seat], playerName : "Free Seat", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand: false, avatar: ''};
      updateUser(user.name, 0, user.room);
      this.tableData.players--;
      this.room.in(user.room).emit('updateTable', this.playerData);
    })

    /* Bet, Fold, Check */

    socket.on('fold_hand', (data) => {
      const user = getUser(socket.id);
      let seat = user.seat;
      this.playerData[seat] = {...this.playerData[seat], hand : [], showHand: false};
      this.room.in(user.room).emit('updateTable', this.playerData);
      // Next user && turn to be implemented
    })

    socket.on('check_hand', (data) => {
      const user = getUser(socket.id);
      // user checks & next user & turn to be implemented
    })

    socket.on('bet_hand', (data) => {
      const user = getUser(socket.id);
      const bet = this.playerData[user.seat].lastBet + data.betAmount;
      this.playerData[user.seat] = {...this.playerData[user.seat], lastBet: bet, showHand: false};
      this.room.in(user.room).emit('updateTable', this.playerData);
      // next user & turn to be implemented
    })
    })
    }
}

module.exports = {Room}