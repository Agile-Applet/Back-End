require('dotenv').config();
import { Router } from 'express';
const bcryptjs = require("bcryptjs");
const SALT = process.env.SALT; // Bcrypt rounds
const {check, validationResult} = require('express-validator');
const router = Router();

const router = express.Router();

// Connect to database
const dbo = require('./conn');

router.post('/login', (req, res) => {

})

router.post('/logout', (req, res) => {

})

router.post(
    '/register',
    console.log('ye')
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
            const dbConnect = dbo.getDb();
            let user = await dbConnect.collection('users').find(username)
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