const mongoose = require('mongoose');

const TaskSchema = mongoose.Schema({
    projectName:{
        type: String,
    },
    projectType:{
        type: String,
    },
    projectDescription:{
        type: String,
    },
    personsInvolved:{
        type: String,
    },
    amountRequired:{
        type: String,
    },
    location:{
        type: String,
    },
    duration:{
        type: String,
    },
    from:{
        type: String,
    },
    to:{
        type: String,
    },
    date:{
        type: Date,
        default:Date.now
    }
});

let Task = module.exports = mongoose.model('Task', TaskSchema);