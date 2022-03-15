const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const { addUser, updateUser, getUser, deleteUser, getUsers } = require('./users')
const express = require('express');
const cors = require('cors');
const dbo = require('./conn');
//const { table } = require('console');
const PORT = process.env.PORT || 3001;
const dateNow = new Date();

app.use(cors({origin: 'http://localhost:3001'}));
app.use(express.json());
app.use(require('./record'));
app.use(require('./user/session'))
app.use(require('./user/auth'))
app.use(require('./routes/money'));

let randomHands = [
  [{card : "As"}, {card: "Ks"}],
  [{card : "3s"}, {card: "9s"}],
  [{card : "2s"}, {card: "As"}],
  [{card : "Js"}, {card: "Qs"}],
  [{card : "5s"}, {card: "5s"}],
]

let rank = [2,3,4,5,6,7,8,9,'T','J','Q','K','A'];
let suit = ['c','d','h','s']

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomHand() {
  let card1 = rank[getRandomInt(12)] + suit[getRandomInt(3)];
  let card2 = rank[getRandomInt(12)] + suit[getRandomInt(3)];
  return [{card: card1}, {card: card2}];
}

let avatars = [
  'https://content-eu.invisioncic.com/b310290/monthly_2017_04/Nikolay-Kostyrko_Time1491772457527.jpg.2d6ef3b3f499abd15f631f55bbc2aba5.jpg',
  'https://pickaface.net/gallery/avatar/MsMattheis54086b03941f8.png',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjgQWa7pOSm_kU8Hx4j2V3ebQYfkBkBDehcMbKqEZEUuh2LE4OELW8lG0nYs1P7O6fii4&usqp=CAU',
  'https://pickaface.net/gallery/avatar/unr_padreirene_180720_1215_wuaaj.png',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRlZRhdBjXKq_kKjZ7Gx9kom1sBkk0WYFQPchjkcNFbmijoVoKXlq0dypJPthCmHx6BHc&usqp=CAU',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ2p__fecPLO2nG02fp9yax0tlWFcjCQgNwg&usqp=CAU'
];

let tableData = {
  name : "Pöytä 1",
  players : 0,
  maxPlayers : 6,
  currentTurn : 0,
  socketId : null,
}

let playerData = [
{playerId: 1, playerName : "Pelaaja 1", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand: false, handPosition: 'player-cards-right', avatar: ''},
{playerId : 2, playerName : "Pelaaja 2", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand : true, handPosition: 'player-cards-left', avatar: ''},
{playerId : 3, playerName : "Pelaaja 3", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand : true, handPosition: 'player-cards-right', avatar: ''},
{playerId : 4, playerName : "Pelaaja 4", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand : true, handPosition: 'player-cards-left', avatar: ''},
{playerId : 5, playerName : "Pelaaja 5", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand : true, handPosition: 'player-cards-left', avatar: ''},
{playerId : 6, playerName : "Pelaaja 6", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand : true, handPosition: 'player-cards-right', avatar: ''}
];

// Welcome page.
app.get('/', (req, res) => {
  res.send("Server is up and running with the latest version! " + dateNow)
})

// Global error handling.
app.use(function (err, _req, res) {
  console.error(err.stack);
  //res.status(500).send('Something broke!');
});

// Perform a database connection when the server starts.
dbo.connectToServer(function (err) {
  if (err) {
    console.error("err");
    process.exit();
  };

    // Socket.io connection handling.
    /*io.on('connection', (socket) => {
      socket.on('login', ({ name, room }, callback) => {

        const dbConnect = dbo.getDb();

        dbConnect
          .collection("rooms")
          .findOne({ room_name: room })
          .then((data) => {
            if (!data) {

              const roomsDocument = {
                socket_id: socket.id,
                room_name: room,
                max_users: 2
              };

              dbConnect
                .collection('rooms')
                .insertOne(roomsDocument, function (err, result) {
                  if (err) {
                    res.status(400).send('Error inserting room!');
                  } else {
                    console.log(`Added a new room with id ${result.insertedId}`);
                    //res.status(204).send();
                  }
                });
            }
          });

        const { user, error } = addUser(socket.id, name, room)
        if (error) return console.error(error) //callback
        console.log("User connected : " + user.id);
        socket.join(user.room)
        socket.in(room).emit('notification', { title: 'Someone\'s here', description: `${user.name} just entered the room` })
        io.in(room).emit('notification', {test: "123", title : "Test", description : "asd"});
        io.in(room).emit('users', getUsers(room))
        //callback(0)
      })*/

      /* Main Connections */

      io.on('connection', (socket) => {
        console.log("User connected : " + socket.id);

        socket.on("disconnect", () => {
          console.log("User disconnected");
          const usr = getUser(socket.id);
          playerData[usr.seat] = {...playerData[usr.seat], playerName : "Free Seat", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand: false, avatar: ''};
          const user = deleteUser(socket.id)
          tableData.players--;
          console.log("Current players: " + tableData.players + " of " + tableData.maxPlayers);
          if (user) {
            /*io.in(user.room).emit('notification', { title: 'Someone just left', description: `${user.name} just left the room` })
            io.in(user.room).emit('users', getUsers(user.room))*/
            io.in(user.room).emit('updateTable', playerData);
          }
        })

      /* Join Rooms (as a spectator) */

      socket.on('join_room', (data) => {
          const { user, error } = addUser(socket.id, data.name, 0, data.room)
          socket.join(data.room)
         /*io.in(data.room).emit('notification', {test: "123", title : "Test", description : "asd"});
          io.in(data.room).emit('users', getUsers(data.room))
          console.log(data);
          */
          io.in(data.room).emit('updateTable', playerData);
      })

      /* Game Seating */

      /* Joining Free Seat */

      socket.on('join_seat', (data) => {
        if ( tableData.players < tableData.maxPlayers ) {
          let seat = data.seatId-1;
          if ( playerData[seat].seatStatus == 0 ) {
            console.log(data);
            const user = getUser(socket.id);
            if ( user.seat && user.seat != 0 ) {
              return socket.emit('userError', {action: "join_seat", status: "failed", message: "Olet jo toisella pöytäpaikalla."})
            }
            tableData.players++;
            updateUser(user.name, seat, user.room);
            playerData[data.seatId-1] = {...playerData[seat], playerName : user.name, seatStatus: 1, money: data.amount, lastBet: 0, hand : getRandomHand(), showHand: false, avatar: avatars[getRandomInt(5)]};
            io.in(user.room).emit('updateTable', playerData);
            console.log("Current players: " + tableData.players + " of " + tableData.maxPlayers);
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
        playerData[seat] = {...playerData[seat], playerName : "Free Seat", seatStatus: 0, money: 0, lastBet: 0, hand : [], showHand: false, avatar: ''};
        updateUser(user.name, 0, user.room);
        tableData.players--;
        io.in(user.room).emit('updateTable', playerData);
      })

      /* Bet, Fold, Check */

      socket.on('fold_hand', (data) => {
        const user = getUser(socket.id);
        let seat = user.seat;
        playerData[seat] = {...playerData[seat], hand : [], showHand: false};
        io.in(user.room).emit('updateTable', playerData);
        // Next user && turn to be implemented
      })

      socket.on('check_hand', (data) => {
        const user = getUser(socket.id);
        // user checks & next user & turn to be implemented
      })

      socket.on('bet_hand', (data) => {
        const user = getUser(socket.id);
        const bet = playerData[user.seat].lastBet + data.betAmount;
        playerData[user.seat] = {...playerData[user.seat], lastBet: bet, showHand: false};
        io.in(user.room).emit('updateTable', playerData);
        // next user & turn to be implemented
      })

      /* Other events, currently not in use */

      /*socket.on('sendMessage', message => {
        const user = getUser(socket.id)
        io.in(user.room).emit('message', { user: user.name, text: message });
      })

      socket.on('sendCardValue', value => {
        const user = getUser(socket.id)
        io.in(user.room).emit('value', { user: user.name, text: value });
      })*/

    })
  });

    // Start the Express server.
    http.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });

  module.exports = app;
