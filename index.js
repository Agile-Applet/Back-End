const app = require('express')()
const https = require('https').createServer(app)
const io = require('socket.io')(https)
const { addUser, getUser, deleteUser, getUsers } = require('./users')
const express = require('express');
const cors = require('cors');
const dbo = require('./conn');
const PORT = process.env.PORT || 3000;
const dateNow = new Date();

app.use(cors());
app.use(express.json());
app.use(require('./record'));
app.use(require('./user/session'))
app.use(require('./user/auth'))
app.use(require('./routes/money'));

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
    io.on('connection', (socket) => {
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
                    //res.status(400).send('Error inserting room!');
                  } else {
                    console.log(`Added a new room with id ${result.insertedId}`);
                    //res.status(204).send();
                  }
                });
            }
          });

        const { user, error } = addUser(socket.id, name, room)
        if (error) return callback(error)
        socket.join(user.room)
        socket.in(room).emit('notification', { title: 'Someone\'s here', description: `${user.name} just entered the room` })
        io.in(room).emit('users', getUsers(room))
        callback()
      })

      socket.on('sendMessage', message => {
        const user = getUser(socket.id)
        io.in(user.room).emit('message', { user: user.name, text: message });
      })

      socket.on('sendCardValue', value => {
        const user = getUser(socket.id)
        io.in(user.room).emit('value', { user: user.name, text: value });
      })

      socket.on("disconnect", () => {
        console.log("User disconnected");
        const user = deleteUser(socket.id)
        if (user) {
          io.in(user.room).emit('notification', { title: 'Someone just left', description: `${user.name} just left the room` })
          io.in(user.room).emit('users', getUsers(user.room))
        }
      })
    })

    // Start the Express server.
    https.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  });

  module.exports = app;
