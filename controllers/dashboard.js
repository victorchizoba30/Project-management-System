const express = require('express');
const router = express.Router();
const Task = require('../models/task');


router.get('/dashboard', (req, res) => {
    Task.find({}, (err, task)=>{
        res.render('dashboard',{
            task: task
        })
    })
});

//save task
router.post('/dashboard', (req, res) => {

    let task = new Task();
    task.projectName = req.body.projectName;
    task.projectType = req.body.projectType;
    task.projectDescription = req.body.projectDescription;
    task.personsInvolved = req.body.personsInvolved;
    task.amountRequired = req.body.amountRequired;
    task.location = req.body.location;
    task.duration = req.body.duration;
    task.from = req.body.from;
    task.to = req.body.to;

    task.save().then(user => {
        req.flash('success_msg', 'New task listed')
        res.redirect('/')
    }).catch(err => {
        console.log(err)
    });

});

//get single task
router.get('/:id', (req,res)=>{
    Task.findById(req.params.id, (err, task)=>{
        res.render('singleTask',{
            task: task
        })
    })
})


module.exports = router;