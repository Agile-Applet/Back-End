require("dotenv").config();
const express = require("express");
const bcryptjs = require("bcryptjs");
const SALT = process.env.SALT; // Bcrypt rounds
const { check, validationResult } = require("express-validator");
const router = express.Router();
const DEFAULT_EXPIRATION = process.env.DEFAULT_EXPIRATION || 3600;
const redisClient = require('../redis');

// Connect to database.
const dbo = require("../conn");

// Login.
// TODO: tarkistus onko käyttäjä bannitty
router.post("/login", async (req, res) => {
  const dbConnect = dbo.getDb();
  const { username, password } = req.body;
  const query = { username: username };
  const cachedValue = await redisClient.get(username);

  if (req.session.username) {
    res.status(401).json("Already logged in");
  } else {
    if (cachedValue === null) {
      await dbConnect.collection("players").findOne(query, (err, result) => {
        if (err) res.status(401).json("Error fetching player data.");
        let user = result;
        if (!user) {
          return res.status(401).json("User does not exist.");
        } else {
          const isMatch = bcryptjs
            .compare(password, user.password)
            .then((match) => {
              if (!match) {
                res.status(401).json("Password mismatch.");
              } else {
                req.session.username = username;
                req.session.isLogged = true;
                redisClient.setEx(username, DEFAULT_EXPIRATION, JSON.stringify({
                  username: username,
<<<<<<< HEAD
                  saldo: user.saldo, //saldo
=======
                  saldo: user.saldo,
>>>>>>> 6cd737a291d519365101420669184c4968cb2036
                  isAdmin: false,
                  isLogged: true,
                  message: "Logged in successfully.",
                  cookie: req.session.cookie,
                  sessionID: req.sessionID
                }));
                return res
                  .status(200)
                  .json({
                    username: username,
                    saldo: user.saldo,
                    isAdmin: false,
                    isLogged: true,
                    message: "Logged in successfully.",
                    cookie: req.session.cookie,
                    sessionID: req.sessionID,
                  });
              }
            });
        }
      });
    } else {
      return res.status(200).json(JSON.parse(cachedValue));
    }
  }
});

// Check if user has logged in.
router.post("/isLogged", (req, res) => {
  if (req.session.isLogged) {
    res.status(200).json(true);
  } else {
    res.status(401).json(false);
  }
});

// Logout.
router.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(400).json("Unable to log out.");
      } else {
        redisClient.del(req.body.username);
        res.status(200).json("Logout successful.");
      }
    });
  } else {
    res.end();
  }
});

// TODO: Add validations.
router.post("/register", async (req, res) => {
  const { listing_id, username, email, password } = req.body;

  const dbConnect = dbo.getDb();
  await dbConnect
    .collection("players")
    .findOne({ username: username })
    .then((data) => {
      if (data) {
        res.status(409).send("Username already taken.");
      } else {
        const dbConnect = dbo.getDb();

        const salt = bcryptjs.genSaltSync(parseInt(SALT));
        const hashedPassword = bcryptjs.hashSync(password, salt);

        const playersDocument = {
          listing_id: listing_id,
          last_modified: new Date(),
          username: username,
          saldo: 100.0,
          usergroup: 0,
          email: email,
          password: hashedPassword,
        };
        dbConnect
          .collection("players")
          .insertOne(playersDocument, (err, result) => {
            if (err) {
              res.status(400).json("Error inserting player!");
            } else {
              console.log(`Added a new player with id ${result.insertedId}.`);
              res.status(201).json("Register done.");
            }
          });
      }
    });
});

module.exports = router, { redisClient };
