const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const express = require("express");
const cors = require("cors");
const dbo = require("./conn");
const PORT = process.env.PORT || 3001;
const dateNow = new Date();

const { Room } = require("./Room");

app.use(cors());
app.use(express.json());
app.use(require("./record"));
app.use(require("./user/session"));
app.use(require("./user/auth"));
app.use(require("./routes/money"));

// Welcome page.
app.get("/", (req, res) => {
  res.send("Server is up and running with the latest version! " + dateNow);
});

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
  }

  /* Room creation */

  const roomData = [
    {
      uri: "table1",
      name: "Pöytä 1",
      description: "Aloittelija pöytä",
      minBuy: 100,
      maxBuy: 1000,
    },
  ];
  let createdRooms = [];
  roomData.map((r) => {
    console.log(r);
    let nRoom = new Room(io, r.uri, r.name, r.description, r.minBuy, r.maxBuy);
    createdRooms.push(nRoom);
  });
});

// Start the Express server.
http.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

module.exports = app;
