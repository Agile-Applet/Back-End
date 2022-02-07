const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const MONGODB_URL=process.env.mongodb


const ConnectToMongo = async () => {
    try {
        await mongoose.connect(MONGODB_URL, {
            useNewUrlParser: true
        })
        console.log('Connected to Mongodb')
        mongoose.set('debug', true)
    }catch(e) {
        console.log(e)
        throw e
    }
}

module.exports = ConnectToMongo