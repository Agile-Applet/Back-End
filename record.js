const express = require('express');
const recordRoutes = express.Router();

// Connect to the database.
const dbo = require('./conn');

// All player records.
recordRoutes.route('/players').get(async function (req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection('players')
    .find({})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        console.log('Error fetching players!');
        return res.status(400).send('Error fetching players!');
      } else {
        console.log('Players fetched.');
        return res.status(200).json(result);
      }
    })
});

// All room records.
recordRoutes.route('/rooms').get(async function (req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection('rooms')
    .find({})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        console.log('Error fetching rooms!');
        return res.status(400).send('Error fetching rooms!');
      } else {
        console.log('Rooms fetched.');
        return res.status(200).json(result);
      }
    })
});

// Single player record.
recordRoutes.route('/players/:listing_id').get(async function (req, res) {
  const dbConnect = dbo.getDb();
  const query = { listing_id: req.params.listing_id };

  dbConnect
    .collection('players')
    .find(query)
    .limit(1)
    .toArray(function (err, result) {
      if (err) {
        console.log('Error fetching player!');
        return res.status(400).send('Error fetching player!');
      } else {
        console.log('Player fetched.')
        return res.status(200).json(result);
      }
    })
});

// Single room record.
recordRoutes.route('/rooms/:room_name').get(async function (req, res) {
  const dbConnect = dbo.getDb();
  const query = { room_name: req.params.room_name };

  dbConnect
    .collection('rooms')
    .find(query)
    .limit(1)
    .toArray(function (err, result) {
      if (err) {
        console.log('Error fetching room!');
        return res.status(400).send('Error fetching room!');
      } else {
        console.log('Room fetched.')
        return res.status(200).json(result);
      }
    })
});

// Create a new player record.
recordRoutes.route('/players/add').post(function (req, res) {
  const dbConnect = dbo.getDb();
  const playersDocument = {
    listing_id: req.body.listing_id,
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
        console.log('Error inserting player!');
        res.status(400).send('Error inserting player!');
      } else {
        console.log(`Added a new player with id ${result.insertedId}`);
        res.status(200).send(`Added a new player with id ${result.insertedId}.`);
      }
    });
});

// Update a record player by id.
recordRoutes.route('/players/update/:listing_id').post(function (req, res) {
  const dbConnect = dbo.getDb();
  const listingQuery = { listing_id: req.params.listing_id };
  const newvalues = { $set: req.body };

  dbConnect
    .collection('players').updateOne(listingQuery, newvalues, function (err, result) {
      if (err) {
        console.log(`Error deleting player with id ${listingQuery.listing_id}!`);
        return res.status(400).send(`Error deleting player with id ${listingQuery.listing_id}!`);
      } else {
        console.log('1 document updated.');
        res.status(200).send('1 document updated.');
      }
    });
});

// Delete a player record.
recordRoutes.route('/players/delete/:listing_id').delete((req, res) => {
  const dbConnect = dbo.getDb();
  const listingQuery = { listing_id: req.params.listing_id };

  dbConnect
    .collection('players')
    .deleteOne(listingQuery, function (err, result) {
      if (err) {
        console.log(`Error deleting player with id ${listingQuery.listing_id}!`);
        return res.status(400).send(`Error deleting player with id ${listingQuery.listing_id}!`);
      } else {
        console.log('1 document deleted.');
        return res.status(200).send('1 document deleted.');
      }
    });
});

module.exports = recordRoutes;
