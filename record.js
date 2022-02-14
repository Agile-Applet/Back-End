require('dotenv').config()

const express = require('express');
const recordRoutes = express.Router();

// Connect to the database.
const dbo = require('./conn');

// All records.
recordRoutes.route('/players').get(async function (req, res) {

  const dbConnect = dbo.getDb();

  dbConnect
    .collection('players')
    .find({})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching players!');
      } else {
        res.json(result);
      }
    });
});

// Single record.
recordRoutes.route('/players/:id').get(authenticateToken, (req, res) => {

  const dbConnect = dbo.getDb();
  const query = { listing_id: req.params.id };

  dbConnect
    .collection('players')
    .find(query)
    .limit(1)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching player!');
      } else {
        res.json(result);
      }
    });
});

// Create a new record.
recordRoutes.route('/players/add').post(async function (req, res) {

  const dbConnect = dbo.getDb();

  let hashedPassword = "";

  try {
    hashedPassword = await bcrypt.hash(req.body.password, 10);
  } catch {
    res.status(500).send('Error creating password!');
  }

  const playersDocument = {
    listing_id: req.body.id,
    last_modified: new Date(),
    username: req.body.username,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: hashedPassword
  };

  dbConnect
    .collection('players')
    .insertOne(playersDocument, function (err, result) {
      if (err) {
        res.status(400).send('Error inserting player!');
      } else {
        console.log(`Added a new player with id ${result.insertedId}`);
        res.status(204).send();
      }
    });
});

// Update a record by id.
recordRoutes.route('/players/update/:id').post(function (req, res) {

  const dbConnect = dbo.getDb();

  const listingQuery = { listing_id: req.params.id };
  const newvalues = { $set: { username: "Pekka2" } };


  dbConnect
    .collection("players").updateOne(listingQuery, newvalues, function (err, res) {
      if (err) {
        res
          .status(400)
          .send(`Error deleting player with id ${listingQuery.listing_id}!`);
      } else {
        console.log('1 document deleted');
        res.status(204).send();
      }
    });
});

// Delete a record.
recordRoutes.route('/players/delete/:id').delete((req, res) => {

  const dbConnect = dbo.getDb();
  const listingQuery = { listing_id: req.params.id };

  dbConnect
    .collection('players')
    .deleteOne(listingQuery, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error deleting player with id ${listingQuery.listing_id}!`);
      } else {
        res.status(204).send();
        console.log('1 document deleted');
      }
    });
});

//Authserver stuff, move these.
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

let refreshTokens = [];

//Authenticate user.
recordRoutes.route('/login').post(async function (req, res) {

  const dbConnect = dbo.getDb();

  let user = {};

  dbConnect
    .collection('players')
    .find({})
    .toArray(async function (err, result) {
      if (err) {
        res.status(400).send('Error fetching players!');
      } else {
        user = await result.find(user => user.username === req.body.username);
        try {
          if (await bcrypt.compare(req.body.password, user.password)) {
            /*const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.json({ accessToken: accessToken });*/

            const username = req.body.username
            const user = { name: username }

            const accessToken = generateAccessToken(user)
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
            refreshTokens.push(refreshToken)
            res.json({ accessToken: accessToken, refreshToken: refreshToken })

          } else {
            res.send('Wrong password!');
          }
        } catch {
          res.status(500).send('Error matching credentials!');
        }
      }
    });
});

// New token
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1min' })
}

// Validate token
function authenticateToken(req, res, next) {

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

module.exports = recordRoutes;
