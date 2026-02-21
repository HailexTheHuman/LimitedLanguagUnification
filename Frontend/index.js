const express = require('express');
const app = express();
const port = 3000;
const cookies = require('cookie-session');

console.log("Frontend started!")

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(cookies({
    name: 'session',
    secret: 'notCookieMonster',
    maxAge: 1000 * 60 * 60 * 2
}));


app.get('/', (req, res) => {
    res.redirect('/main');
});


app.get('/login', (req, res) => {
    let model = {
        username: '',
        password: '',
        message: ''
    };

    res.render('login', model);
});

app.post('/login', async (req, res) => {
    loginSuccessful = false;
    const { username, password } = req.body;
    

    const user = await fetch('http://localhost:3001/getUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({ username: username, password: password })
    });
    const userData = await user.json();
    console.log(userData);
    if (userData && userData.password === password) {
        loginSuccessful = true;
    }
    
    if (loginSuccessful) {
        req.session.username = username
        res.redirect('/main');
    } else {
        req.session = null;
        let model = {
            username: username,
            password: password,
            message: 'Invalid credentials'
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
    const { context, prompt, model } = req.body;

    const response = await (await fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ context: context, prompt: prompt, model: model })
    })).json();

    res.json(await response);
})

function setup() {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

exports.setup = setup;

setup()