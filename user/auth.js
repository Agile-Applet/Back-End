require('dotenv').config();
const express = require('express');
const bcryptjs = require("bcryptjs");
const session = require('express-session');
const SALT = process.env.SALT; // Bcrypt rounds
const {check, validationResult} = require('express-validator');

const router = express.Router();

// Connect to database
const dbo = require('../conn');


// Login
// TODO: tarkistus onko koneella joku kirjautunut jo
// TODO: tarkistus onko käyttäjä bannitty
router.post('/login', async (req, res) => {
    const {username, password} = req.body;

    const dbConnect = dbo.getDb();
    const query = { username: username };
    
    await dbConnect.collection('players').findOne(query, (err, result) => {
        if(err) res.status(401).json('You shall not pass'); // error
        let user = result;
          if(!user){ 
              return res.status(401).json('You shall not pass!'); // user doesn't exist
          }else{
            const isMatch = bcryptjs.compare(password, user.password);
            if(!isMatch) res.status(401).json('You shall not pass') // Password mismatch
        
            req.session.username = username
            return res.status(200).json("Logged in")
          }

    })
})


// Logout
router.delete('/logout', (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          res.status(400).send('Unable to log out')
        } else {
          res.send('Logout successful')
        }
      });
    } else {
      res.end()
    }
  })

router.get('/tester', (req, res) => {
    if(req.session) {
        console.log(req.session)
        res.status(200).send('yee');
    }else{
        res.send('yes')
    }
})



// TODO: Add function to check if player or email exists
router.post('/register', async (req, res ) => {

    const dbConnect = dbo.getDb();
    const {username, email, password } = req.body;
  
    const salt = bcryptjs.genSaltSync(parseInt(SALT));
    const hashedPassword = bcryptjs.hashSync(password, salt);

    const playersDocument = {
        listing_id: req.body.id,
        last_modified: new Date(),
        username: username,
        email: email,
        password: hashedPassword
};
    dbConnect
    .collection('players')
    .insertOne(playersDocument, (err, result) => {
        if (err) {
        res.status(400).json('Error inserting player!');
        } else {
        console.log(`Added a new player with id ${result.insertedId}`);
        res.status(204).json('Register done');
            }
        });
    }
)

module.exports = router;