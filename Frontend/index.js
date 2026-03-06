const express = require('express');
const app = express();
const port = 3000;
const cookies = require('cookie-session');
const bcrypt = require('bcrypt');
const mailer = require('nodemailer');
require('dotenv').config();


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


// let transporter;
// mailer.createTestAccount((err, account) => {
//     if (err) {
//         console.error("Failed to create a testing account. " + err.message);
//         return;
//     }

//     // Create a transporter using the Ethereal test account credentials
//     transporter = mailer.createTransport({
//         host: account.smtp.host,
//         port: account.smtp.port,
//         secure: account.smtp.secure,
//         auth: {
//         user: account.user,
//         pass: account.pass,
//         },
//     });

//     // Send a test message
//     transporter.sendMail({
//         from: "Example App <no-reply@example.com>",
//         to: "user@example.com",
//         subject: "Hello from tests",
//         text: "This message was sent from a Node.js integration test.",
//     })
//     .then((info) => {
//         console.log("Message sent: %s", info.messageId);
//         // Get a URL to preview the message in Ethereal's web interface
//         console.log("Preview URL: %s", mailer.getTestMessageUrl(info));
//     })
//     .catch(console.error);
// });


const transporter = mailer.createTransport({
    service: 'Gmail',
    // host: 'smtp.ethereal.com',
    // port: 587,
    port: 2323,
    // secure: false,
    // authMethod: "LOGIN",
    auth: {
        // type: "login",
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

/**
 * the main route of the frontend, redirects to the main page
 */
app.get('/', (req, res) => {
    res.redirect('/main');
});

/**
 * the logout route of the frontend, clears the session and redirects to the login page
 */
app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login');
});

/**
 * the login route of the frontend.
 * if the user is already logged in, redirects to the main page
 */
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

/**
 * the register route of the frontend.
 * if the user is already logged in, redirects to the main page
 */
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

/**
 * the verify route of the frontend.
 * if the user is already logged in and verified, redirects to the main page
 */
app.get('/verify', (req, res) => {
    if (req.session.username && req.session.isVerified) {
        res.redirect('/main');
    } else {
        let model = {
            verificationCode: ''
        };

        res.render('verify', model);
    }
});




app.post('/verify', async (req, res) => {
    let verifySuccessful = false;
    const verificationCode = req.body.verificationCode;
    

    const user = await fetch('http://localhost:3001/getUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({ username: req.session.username })
    });
    const userData = await user.json();
    console.log(userData);
    if (userData && verifyPassword(verificationCode+"", userData.verificationCode)) {
    // if (userData && verificationCode == userData.verificationCode) {
        const verifiedUser = await fetch('http://localhost:3001/verifyUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({ username: req.session.username })
        });
        console.log(`verifiedUser: `, verifiedUser)
        verifySuccessful = true;
    }
    
    if (verifySuccessful) {
        req.session.isVerified = true;
        res.redirect('/main');
    } else {
        // req.session = null;
        let model = {
            verificationCode: verificationCode
        };
        res.render('verify', model);
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
        req.session.isVerified = userData.isVerified;
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
        console.log(`from: ${process.env.EMAIL_USER}, to: ${email}`);
        let verificationCode = Math.floor(Math.random()*9999);
        const info = await transporter.sendMail({
            from: `"Limited Language Unification" <noreply@llu.app>`,
            to: email,
            subject: "Verification Email",
            text: "Thank you for registering for Limited Language Unification! Please verify your email to complete the registration process.",
            html: `<p>Thank you for registering for Limited Language Unification! Please verify your email to complete the registration process. Use the following code: </p><h2>${verificationCode}`,
        })
        .then((info) => {
            console.log("Message sent: %s", info.messageId);
            // Get a URL to preview the message in Ethereal's web interface
            console.log("Preview URL: %s", mailer.getTestMessageUrl(info));
        })
        let encryptedVerificationCode = encryptPassword(verificationCode+"");
        const registeredUser = await fetch('http://localhost:3001/createUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({ username: username, password: encryptedPassword, email: email, isVerified: false, verificationCode: encryptedVerificationCode })
        });
        const newUserData = await registeredUser.json();
        if (newUserData) {
            registerSuccessful = true;
        }
    }
    
    if (registerSuccessful) {
        req.session.username = username;
        res.redirect('/verify');
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

/**
 * the main page of the frontend.
 * if the user is not logged in, redirects to the login page.
 * if the user is logged in but not verified, redirects to the verify page.
 * if the user is logged in and verified, renders the main page.
 */
app.get('/main', async (req, res) => {
    if (req.session.username && req.session.isVerified) {
        const user = await fetch('http://localhost:3001/getUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: req.session.username })
        });
        const models = await fetch('http://localhost:3001/getModels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })

        let jsonResult = await models.json();

        console.log(jsonResult[0]);

        res.render('main', {user: await user.json(), models: jsonResult});
    } else if (req.session.username){
        res.redirect('/verify');
    } else {
        res.redirect('/login');
    }
})
/**
 * this is the endpoint for the frontend to send a prompt to the backend.
 * it is a post-request with the following body:
 * @param {Array[Object]} context the context of the conversation
 * @param {string} prompt the prompt to generate a response to
 * @param {string} model the model to use to generate the response
 * @param {string} resPrefix the prefix to use for the response
 * @param {Object} params the parameters to use for the response
 * @param {string} role the role of the user
 * @returns {Object} the response to the prompt
 */
app.post('/sendPrompt', async (req, res) => {
    const { context, prompt, model, resPrefix, params, role } = req.body;

    const response = await (await fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ context: context, prompt: prompt, model: model, resPrefix: resPrefix, params: params, role: role })
    })).json();

    res.json(await response);
})

/**
 * this is the endpoint for the frontend to set the conversation history of a user.
 * it is a post-request with the following body:
 * @param {string} username the username of the user to set the conversation history of
 * @param {string} password the password of the user to set the conversation history of
 * @param {Array[Object]} conversation the conversation history of the user to set
 * @returns {Object} a confirmation that the conversation history was set
 */
app.post('/setConversationHistory', async (req, res) => {
    const { username, password, conversation } = req.body;
    const response = await fetch('http://localhost:3001/setConversationHistory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password, conversation: conversation })
    });
    res.json(await response.json());
})

/**
 * a temporary function used to set up the frontend, it is not needed and can be safely removed
 */
function setup() {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}


exports.setup = setup;

setup()