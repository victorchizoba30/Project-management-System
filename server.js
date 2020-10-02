const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const PORT = 8000;
const app = express();

//initialize mongoose
mongoose.connect('mongodb://localhost/projectManagement', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((res) => {
    console.log('connected to project management system database')
}).catch((err) => {
    console.log(err)
});

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// passport use
passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
}, async (req, email, password, done) => {
    await User.findOne({ email: email }).then(async user => {
        if (!user) {
            return done(null, false, { message: 'Email not registered' });
        }
        await bcrypt.compare(password, user.password, function (err, isMatch) {
            if (err) {
                return err;
            }
            if (!isMatch) {
                return done(null, false, { message: 'Invalid password' });
            }
            return done(null, user, req.flash('success-message', 'Login Successful'));
        })
    }).catch(err => { console.log(err) });
}));


//seiallize user
passport.serializeUser(function (user, done) {
    done(null, user.id)
});

//deseiallize user
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

//ejs
app.use(expressLayouts);
app.set('view engine', 'ejs');

// body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//express session midleware
app.use(session({
    secret: '({[<>}])',
    saveUninitialized: false, //if saved to true tis session will be saved on the server on each request no matter if something change or not
    resave: false,
    cookie: { maxAge: Date.now() + 3600000 }
}));


//connect flash
app.use(flash());

//global variable
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    // res.locals.user = req.user;
    next();
})

//static file
app.use(express.static(path.join(__dirname, 'public')));

// controllers
app.use('/dashboard', require('./controllers/dashboard'));
// app.use('/users', require('./controllers/users'));

// routes
app.get('/index.ejs', (req, res) => res.render('index'));
app.get('/about.ejs', (req, res) => res.render('about'));
app.get('/contact.ejs', (req, res) => res.render('contact'));
app.get('/login.ejs', (req, res) => res.render('login'));
app.get('/register.ejs', (req, res) => res.render('register'));

// register post route
app.post('/register.ejs', (req, res) => {
    const { fullname, email, password, password2 } = req.body;
    let errors = [];

    //check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match, try again' });
    }

    //check passwords length
    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least six characters' });
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
                        fullname,
                        email,
                        password,
                        password2
                    });
                    //hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save().then(user => {
                                req.flash('success_msg', 'Registration Successful')
                                res.redirect('/login.ejs')
                            }).catch(err => {
                                console.log(err)
                            });
                        })
                    })
                }
            });
    }
});

// login post route
app.post('/login.ejs', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/index.ejs',
        failureRedirect: '/login.ejs',
        failureFlash: true
    })(req, res, next);
});

//starting server on localhost:PORT
app.listen(PORT, () => console.log(`server listening on port ${PORT}`));