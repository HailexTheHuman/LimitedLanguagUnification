const express = require('express');
const app = express();
const port = 3000;
const cookies = require('cookie-session');
const bcrypt = require('bcrypt');
const mailer = require('nodemailer');

console.log("Frontend started!")

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(cookies({
    name: 'session',
    secret: 'notCookieMonster',
    maxAge: 1000 * 60 * 60 * 2 //2 hours of cookies before expiring
}));


app.get('/', (req, res) => {
    res.redirect('/main');
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login');
});


app.get('/login', (req, res) => {
    if (req.session.username) {
        res.redirect('/main');
    } else {
        let model = {
            username: '',
            password: '',
            message: ''
        };

        res.render('login', model);
    }
});


app.get('/register', (req, res) => {
    if (req.session.username) {
        res.redirect('/main');
    } else {
        let model = {
            username: '',
            password: '',
            message: '',
            email: ''
        };

        res.render('register', model);
    }
});

app.post('/login', async (req, res) => {
    loginSuccessful = false;
    const { username, password } = req.body;
    const encryptedPassword = encryptPassword(password);
    

    const user = await fetch('http://localhost:3001/getUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({ username: username, password: encryptedPassword })
    });
    const userData = await user.json();
    console.log(userData);
    if (userData && verifyPassword(password, userData.password)) {
        loginSuccessful = true;
    }
    
    if (loginSuccessful) {
        req.session.username = username;
        res.redirect('/main');
    } else {
        console.log("encrypted password: " + encryptedPassword);
        req.session = null;
        let model = {
            username: username,
            password: password,
            message: 'Invalid credentials'
        };
        res.render('login', model);
    }
});

function encryptPassword(password) {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
}

verifyPassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
}

app.post('/register', async (req, res) => {
    registerSuccessful = false;
    message = "";
    const {username, password, email} = req.body;
    const encryptedPassword = encryptPassword(password);
    

    const user = await fetch('http://localhost:3001/getUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({ username: username})
    });
    const userData = await user.json();
    console.log(userData);
    if (userData) {
        message = "You already have an account"
    } else {
        sendEmail(email, "Verification Email", "Thank you for registering for Limited Language Unification! Please verify your email to complete the registration process.");
        const registeredUser = await fetch('http://localhost:3001/createUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({ username: username, password: encryptedPassword, email: email })
        });
        const newUserData = await registeredUser.json();
        if (newUserData) {
            registerSuccessful = true;
        }
    }
    
    if (registerSuccessful) {
        req.session.username = username;
        res.redirect('/main');
    } else {
        req.session = null;
        let model = {
            username: username,
            password: password,
            message: message,
            email: email
        };
        res.render('login', model);
    }
});


app.get('/main', async (req, res) => {
    if (req.session.username) {
        const user = await fetch('http://localhost:3001/getUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: req.session.username })
        });
        res.render('main', {user: await user.json()});
    } else {
        res.redirect('/login');
    }
})

app.post('/sendPrompt', async (req, res) => {
    const { context, prompt, model, resPrefix, params } = req.body;

    const response = await (await fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ context: context, prompt: prompt, model: model, resPrefix: resPrefix, params: params })
    })).json();

    res.json(await response);
})

function setup() {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}




const transporter = mailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});




const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text,
        html: `<p>${text}</p>`
    };

    const info = await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log('Email sent: ' + info.response);
                resolve(info);
            }
        });
    });
}





exports.setup = setup;

setup()