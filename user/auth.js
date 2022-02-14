require('dotenv').config();
const express = require('express');
const bcryptjs = require("bcryptjs");
const session = require('express-session');
const SALT = process.env.SALT; // Bcrypt rounds
const {check, validationResult} = require('express-validator');

const router = express.Router();

// Connect to database
const dbo = require('../conn');



router.post('/test', (req, res) => {
    req.session.test = true;
    res.status(200).send('ye');
})



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
      .insertOne(playersDocument, function (err, result) {
        if (err) {
          res.status(400).send('Error inserting player!');
        } else {
          console.log(`Added a new player with id ${result.insertedId}`);
          res.status(204).send();
        }
      });
})

// TODO: tarkistus onko koneella joku kirjautunut jo
router.post('/login', async (req, res) => {
    const {username, password} = req.body;

    const dbConnect = dbo.getDb();
    const query = { username: username };
    
    await dbConnect.collection('players').findOne(query, (err, result) => {
        if(err) res.status(401).send('You shall not pass');
        let user = result;
          if(!user){ // user doesn't exist
              return res.status(401).send('You shall not pass!');
          }else{
            const isLegit = bcryptjs.compare(password, user.password);
            if(!isLegit) res.status(401).send('You shall not pass') // Password mismatch
        
            req.session.isLogged = true;
            return res.status(200).send("Logged in")
          }

    })
})
    /*
   
              const isLegit = await bcryptjs.compareSync(password, user.password);
              
              if (!isLegit) {
                  res.status(401).send('You shall not pass!');
              }else {
                  req.session.isLogged = true;
                  res.status(200).send("Logged in")
              }
          }
    }
        )
    }catch(e) {
        console.log(e);
        res.status(500).send("Error")
    }
})

*/

    
router.get('/test2', async (req, res) => {
    const dbConnect = dbo.getDb();

    dbConnect.collection('players').findOne({}, (err, res) => {
        if(err) throw error;
        console.log(res);
    })

})

/*
router.post(
    '/register',
    [
        check('username', 'Please Enter a Valid Username').not().isEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'Please enter a valid password').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const {username, email, password} = req.body
        try {
            console.log(username)
            console.log(email)
            console.log(password)
            const dbConnect = dbo.getDb();
            let user = await dbConnect.collection('players').findOne({username : username})
            console.log(user);
            if(user) {
                return res.status(400).json({message: 'Username is already taken.'})
            }
            let em = await dbConnect.find(email);
            if(em) {
                return res.status(400).json({message: 'The email address is already being used.'})
            }
            const salt = bcryptjs.genSaltSync(parseInt(SALT));
            const userPassword = bcryptjs.hashSync(password, salt);

            const userDoc = {
                user_id : req.body.id,
                registered: new Date(),
                username: username,
                email: email,
                password: req.body.password
            };

            dbConnect.collection('users')
            .insertOne(playersDocument, function (err, result) {
                if (err) {
                    res.status(400).send('Error registering user');
                }else {
                    res.status(204).send();
                }
            })
        }

        catch(error){
            console.log(error.message)
            res.status(500).send('Something went wrong.')
        }
    })
    */

module.exports = router;