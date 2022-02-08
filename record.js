const express = require('express');

const recordRoutes = express.Router();

// Connect to the database.
const dbo = require('./conn');

// All records.
recordRoutes.route('/players').get(async function (_req, res) {
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
recordRoutes.route('/players/:id').get((req, res) => {

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

module.exports = recordRoutes;
