const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport')
// const { ensureAuthenticated } = require('../config/auth');
const User = require('../models/User');


//register page


//register handle
router.post('/register', (req, res) => {
    const { firstname, lastname, email, password, password2 } = req.body;
    let errors = [];

    //check require field
    if (!firstname || !lastname || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    //check passwors match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match, try again' });
    }

    //check passwords length
    if (password.length < 6) {
        errors.push({ msg: 'Password must be atleast six characters' });
    }

    var newUser = new User({ firstname: req.body.firstname });
    if (req.body.admincode === 'secretcode123') {
        newUser.isAdmin = true;
    }


    if (errors.length > 0) {
        res.render('register', {
            errors,
            fullname,
            email,
            password,
            password2
        });
    } else {
        //validation pass
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    //user exist
                    errors.push({ msg: ' Email already exist, try with a different email' })
                    res.render('register', {
                        errors,
                        fullname,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        firstname,
                        lastname,
                        email,
                        password,
                        isAdmin
                    });
                    //hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save().then(user => {
                                req.flash('success_msg', 'registered')
                                res.redirect('/users/login')
                            }).catch(err => {
                                console.log(err)
                            });
                        })
                    })
                }
            });
    }
});

//login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

module.exports = router;