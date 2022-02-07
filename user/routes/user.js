const express = require('express')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
dotenv.config()
const SALT = process.env.salt
const jwt = require('jsonwebtoken')
const JWT_SECRET=process.env.jwt
const auth = require('../config/auth')

const {check, validationResult} = require('express-validator')
const router = express.Router()

const User = require('../model/user')


// Register new user
router.post(
    "/signup",
    [
        check("username", "Please Enter a Valid Username").not().isEmpty(),
        check("email", "please enter a valid email").isEmail(),
        check("password", "please enter a valid password").not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
    const { username, email, password } = req.body
    try {
        let user = await User.findOne({username})
        if (user) {
            return res.status(400).json({message: "Username is already taken"})
        }

        user = new User({ username, email, password})

        
        console.log(SALT)
        const salt = bcrypt.genSaltSync(parseInt(SALT))
        user.password = bcrypt.hashSync(password, salt)

        user.save()

        const payload = { user: {id: user.id}}

        jwt.sign(
            payload,
            JWT_SECRET, {
                expiresIn: 3600
            },
            (error, token) => {
                if(error) throw error
                res.status(200).json({token})
            }
        )

    }catch (error){
        console.log(error.message)
        res.status(500).send("Sign-up failed")
    }
    }
)

// Login user
router.post(
    "/login",
    [
        check("username", "please enter a valid username").not().isEmpty(),
        check("password", "please enter a valid password").isLength({min: 6})
    ],
    async (req, res) => {
        const errors = validationResult(req)

        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }

        const { username, password} = req.body
        try {
            let user = await User.findOne({username})
            if(!user) {
                return res.status(400).json({message: "Wrong username or password"}) // user doesn't exist
            }
            
            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({message: "Incorrect password"})

            const payload = {user: {id: user.id}}

            jwt.sign(payload, JWT_SECRET, {expiresIn: "30d"},
            (error, token) => {
                if(error) throw error
                res.status(200).json({token})
                } 
            )
        }catch(error){
            console.log(error)
            res.status(500).json({message: "Login failed."})
        }
    }

)

// Who's logged in
router.get("/logged", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        res.json(user)
    } catch(error) {
        res.send(
            {mes: "Error in fetch"}
            )
        }     
    }
)

module.exports = router