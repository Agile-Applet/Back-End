const jwt = require("jsonwebtoken")
const dotenv = require('dotenv')
dotenv.config()
const JWT_SECRET=process.env.jwt

const verifyUser = (req, res, next) => {
    const token = req.header("token")
    if(!token) return res.status(401).json({message: "Authentication failed"})

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded.user
        next()
    }catch (error) {
        console.error(error)
        res.status(500).send({ message: "Bad Token"})
    }
}

module.exports = verifyUser