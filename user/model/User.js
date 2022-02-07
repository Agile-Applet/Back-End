const mongoose = require('mongoose')

// define
const userSchema = new mongoose.Schema({
    username: {
        type:String, 
        required:true, 
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength: 5
    },
    email:{
        type:String, 
        required:true,
        unique: true
    },
    roles: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }}
)

// compile
module.exports = mongoose.model('User', userSchema)

