const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullname:{
        type: String,
    },
    email:{
        type: String,
    },
    password:{
        type: String,
    },
    date:{
        type: Date,
        default: Date.now()
    }
});


let User = module.exports = mongoose.model('User', UserSchema);