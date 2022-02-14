require("dotenv").config();
const express = require("express");
const bcryptjs = require("bcryptjs");
const SALT = process.env.SALT; // Bcrypt rounds
const { check, validationResult } = require("express-validator");

const router = express.Router();

// Connect to database
const dbo = require("../conn");

// Login
// TODO: tarkistus onko käyttäjä bannitty
router.post("/login", async (req, res) => {
  const dbConnect = dbo.getDb();
  const { username, password } = req.body;
  const query = { username: username };

  if (req.session.username) {
    res.status(401).json("Already logged in");
  } else {
    await dbConnect.collection("players").findOne(query, (err, result) => {
      if (err) res.status(401).json("You shall not pass"); // error
      let user = result;
      if (!user) {
        return res.status(401).json("You shall not pass!"); // user doesn't exist
      } else {
        const isMatch = bcryptjs
          .compare(password, user.password)
          .then((match) => {
            if (!match) {
              res.status(401).json("You shall not pass"); // Password mismatch
            } else {
              req.session.username = username;
              req.session.isLogged = true;
              return res
                .status(200)
                .json({
                  username: username,
<<<<<<< HEAD
                  saldo: user.saldo, //saldo
=======
                  saldo: user.saldo,
>>>>>>> 6cd737a291d519365101420669184c4968cb2036
                  isAdmin: false,
                  isLogged: true,
                  message: "Logged in successfully",
                  cookie: req.session.cookie,
                  sessionID: req.sessionID,
                });
            }
          });
      }
    });
  }
});

// Check if user has logged in
router.post("/isLogged", (req, res) => {
  if (req.session.isLogged) {
    res.status(200).json(true);
  } else {
    res.status(401).json(false);
  }
});

// Logout
router.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(400).json("Unable to log out");
      } else {
        res.status(200).json("Logout successful");
      }
    });
  } else {
    res.end();
  }
});

// TODO: Add validations
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const dbConnect = dbo.getDb();
  await dbConnect
    .collection("players")
    .findOne({ username: username })
    .then((data) => {
      if (data) {
        res.status(409).send("Username already taken");
      } else {
        const dbConnect = dbo.getDb();

        const salt = bcryptjs.genSaltSync(parseInt(SALT));
        const hashedPassword = bcryptjs.hashSync(password, salt);

        const playersDocument = {
          listing_id: req.body.id,
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
              console.log(`Added a new player with id ${result.insertedId}`);
              res.status(201).json("Register done");
            }
          });
      }
    });
});

router.get("/tester", (req, res) => {
  if (req.session) {
    console.log(req.session);
    res.status(200).json("yee");
  } else {
    res.json("yes");
  }
});

module.exports = router;
