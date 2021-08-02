if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const admin = require('./firebase')
const db = admin.firestore();
const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const path = require('path')
var expressLayouts = require('express-ejs-layouts');
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
var session = require('cookie-session');

const methodOverride = require('method-override')

const initializePassport = require('./config/passport-config');

const userCollection = db.collection('users');
const repoCollection = db.collection('repos');


app.use('/', express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use(expressLayouts);

initializePassport(
    passport,
    async email => {
        const userdoc = await userCollection.where('email', '==', email).get();
        if (userdoc.docs.length != 0) {
            return userdoc.docs[0].data()
        } else {
            return null
        }
    },
    async id => {
        const userdoc = await userCollection.where('id', '==', id).get();
        if (userdoc.docs.length != 0) {
            return userdoc.docs[0].data()
        } else {
            return null
        }
    }
)

app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', async (req, res) => {
    res.redirect(302, ('/signin'))
})

app.get('/signin', checkNotAuthenticated, async (req, res) => {
    res.render('signin.ejs', { loggedIn: false, title: "SignIn" })
})

app.get('/signup', checkNotAuthenticated, async (req, res) => {
    res.render('signup.ejs', { loggedIn: false, title: "SignUp" })
})

//documentation
app.get('/documentation', async (req, res) => {
    if (req.isAuthenticated()) {
        res.render('documentation.ejs', { title: "Pricing", loggedIn: req.isAuthenticated(), username: req.user.username })
    }
    else {
        res.render('documentation.ejs', { title: "Pricing" })
    }
})

//features
app.get('/features', async (req, res) => {
    if (req.isAuthenticated()) {
        res.render('features.ejs', { title: "Pricing", loggedIn: req.isAuthenticated(), username: req.user.username })
    }
    else {
        res.render('features.ejs', { title: "Pricing" })
    }
})

app.get('/pricing', async (req, res) => {
    if (req.isAuthenticated()) {
        res.render('pricing.ejs', { title: "Pricing", loggedIn: req.isAuthenticated(), username: req.user.username })
    }
    else {
        res.render('pricing.ejs', { title: "Pricing" })
    }
})

app.get('/new-app', checkAuthenticated, (req, res) => {
    res.render('newapp.ejs', {
        loggedIn: true,
        title: "index",
        username: req.user.username
    })
})

app.post('/new-app', checkAuthenticated, async (req, res) => {
    let checkIfExists = await repoCollection.doc(req.body.appname).get();
    if (req.body.hasOwnProperty('appname') && req.body.appname != 0 && !checkIfExists.exists) {
        let repo = {
            "reponame": req.body.appname || '',
            "port": 0,
            "owner": req.user.username,
            "access": [req.user.username],
            "env-var": "",
            "deploy_error": "",
            "deploying": true,
            "deploy-completed": false,
            "last-deploy": Date.now(),
            "date-created": Date.now()
        }
        try {
            await repoCollection.doc(repo.reponame).set(repo)
            let currentRepo = await userCollection.doc(req.user.username).get()
            currentRepo = currentRepo.data()
            console.log(currentRepo)
            currentRepo.repo.push({ reponame: repo.reponame })
            await userCollection.doc(req.user.username).set(currentRepo)
            console.log("App Created Successfully, Please Wait for full deployment Which Has been Scheduled. Refresh to see status change")
            res.send({ "message": "App Created Successfully, Please Wait for full deployment Which Has been Scheduled. Refresh to see status change." })
        }
        catch (e) {
            console.log(e)
            res.status(404).send({ message: e })
        }
    }
    else {
        console.log(checkIfExists.exists)
    }
})

app.get('/deploys', checkAuthenticated, (req, res) => {
    res.render('deploys.ejs', {
        loggedIn: true,
        title: "index",
        username: req.user.username
    })
})

app.get('/:username?/:reponame?/:backlink?', checkAuthenticated, async (req, res) => {
    let backlink = req.params.backlink || ''
    let reponame = req.params.reponame || ''
    let username = req.params.username || ''

    let issues = false;
    let code = false;
    let pullRequests = false;
    let settings = false;
    let deploys = false;

    async function checkRepoNameWithLocalRepo(fn_reponame) {
        let Ranout = await req.user.repo.every(element => {
            if (element.hasOwnProperty('reponame') && element.reponame == fn_reponame) {
                return true;
            }
        })
        if (await Ranout != true) {
            return false;
        }
        else {
            return true;
        }
    }

    if (reponame.length != 0) {
        if (reponame == 'profile') {
            res.render('profile.ejs', {
                loggedIn: true,
                title: "Profile",
                username: username
            })
        }
        else {
            if (await checkRepoNameWithLocalRepo(reponame) == true) {
                let repo_details = await repoCollection.doc(reponame).get()
                repo_details = repo_details.data()
                switch (backlink) {
                    case 'issues':
                        issues = true
                        break;
                    case 'pull-requests':
                        pullRequests = true
                        break;
                    case 'settings':
                        settings = true
                        break;
                    case 'deploys':
                        deploys = true
                        break;
                    case '':
                        code = true
                        break;
                    default:
                        res.redirect('/')
                }
                res.render('repository.ejs', {
                    loggedIn: true,
                    title: "Dashboard",
                    repo: {
                        reponame: repo_details.reponame,
                        deploying: repo_details.deploying,
                        deploy_completed: repo_details['deploy-completed'],
                        deploy_error: repo_details['deploy_error'],
                        env: repo_details['env-var'],
                    },
                    username: username,
                    screen: { code: code, issues: issues, 'pull-requests': pullRequests, settings: settings, deploys: deploys }
                })
            }
            else {
                res.send("Not found the repo")
            }

        }
    }
    else if (username.length != 0 && username == req.user.username) {
        res.render('dashboard.ejs', {
            loggedIn: true,
            title: "Dashboard",
            username: username,
            repo: req.user.repo
        })
    }
    else {
        res.render('404.ejs', {
            username: req.user.username,
            loggedIn: true,
            title: "404"
        })
    }
})

//signup post
app.post('/register', checkNotAuthenticated, async (req, res) => {
    if (!validateEmail(req.body.email)) {
        res.send({ message: "Email Is not valid" })
    }
    else if (req.body.password.length < 6) {
        res.send({ message: "Password Is less than 6 letters." })
    }
    else {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            var checkIfExists = await userCollection.where('email', '==', req.body.email).get();
            var checkUsername = await userCollection.doc(req.body.username).get()

            if (checkIfExists.docs.length == 0) {
                if (!checkUsername.exists) {
                    await userCollection.doc(req.body.username).set({
                        id: makeid(40),
                        dateCreated: Date.now(),
                        name: req.body.name,
                        username: req.body.username,
                        email: req.body.email,
                        password: hashedPassword,
                        repo: []
                    })
                    res.send({ message: "Registeration Successful" })
                }
                else {
                    res.send({ message: "account with same username already exists, please take another username" })
                }
            }
            else {
                res.send({ message: "account with same email already exists, please enter another email" })
            }
        } catch (e) {
            console.log(e)
            res.send({ message: "Registeration Failure" })
        }
    }

})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: true
}))

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/signin')
})

app.get('*', (req, res) => {
    res.render('404.ejs', { loggedIn: req.isAuthenticated() })
})

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/signup')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect(`/${req.user.username}`)
    }
    next()
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

app.listen(port, () => {
    console.log(`app most likely listening at http://localhost:${port}, If not you are in production.`)
})