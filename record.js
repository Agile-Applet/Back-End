const express = require('express');

const recordRoutes = express.Router();

const redis = require('redis');

const DEFAULT_EXPIRATION = 3600;

const redisClient = redis.createClient();

// Connect to the database.
const dbo = require('./conn');

// Redis connection.
(async () => {

  redisClient.on('error', (err) => console.log('Redis Client Error', err));

  await redisClient.connect();

  console.log("Redis connected: " + redisClient.isOpen);

  /*// Testing Redis.
  await redisClient.set('key', 'value');
  const value = await redisClient.get('key');
  console.log(value);*/
})();

// All records.
recordRoutes.route('/players').get(async function (req, res) {

  const dbConnect = dbo.getDb();

  const cachedValue = await redisClient.get('players');

  if (cachedValue === null) {
    dbConnect
      .collection('players')
      .find({})
      .limit(50)
      .toArray(function (err, result) {
        if (err) {
          res.status(400).send('Error fetching players!');
        } else {
          redisClient.setEx('players', DEFAULT_EXPIRATION, JSON.stringify(result))
          res.json(result);
        }
      })
  } else {
    res.json(JSON.parse(cachedValue));
  }
});

// Single record.
recordRoutes.route('/players/:id').get(async function (req, res) {

  const dbConnect = dbo.getDb();
  const query = { listing_id: req.params.id };

  const cachedValue = await redisClient.get((req.params.id));

  if (cachedValue === null) {
    dbConnect
      .collection('players')
      .find(query)
      .limit(1)
      .toArray(function (err, result) {
        if (err) {
          res.status(400).send('Error fetching player!');
        } else {
          redisClient.setEx(req.params.id, DEFAULT_EXPIRATION, JSON.stringify(result))
          res.json(result);
        }
      })
  } else {
    res.json(JSON.parse(cachedValue));
  }
});

// Create a new record.
recordRoutes.route('/players/add').post(function (req, res) {

  const dbConnect = dbo.getDb();

  const playersDocument = {
    listing_id: req.body.id,
    last_modified: new Date(),
    username: req.body.username,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.password
  };

  console.log(playersDocument);

  dbConnect
    .collection('players')
    .insertOne(playersDocument, function (err, result) {
      if (err) {
        res.status(400).send('Error inserting player!');
      } else {
        res.status(204).send();
        console.log(`Added a new player with id ${result.insertedId}`);
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

module.exports = recordRoutes;
