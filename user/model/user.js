const mongoose = require('mongoose')

// define
const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: true, 
        unique: true
    },
    email: {
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password : {
        type : String,
        required : true,
    },
    roles: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }}
)

// compile
module.exports = mongoose.model('User', userSchema)

