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
            message: ''
        };

        res.render('register', model);
    }
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
        req.session.username = username;
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

app.post('/register', async (req, res) => {
    registerSuccessful = false;
    message = "";
    const {username, password} = req.body;
    

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
        const registeredUser = await fetch('http://localhost:3001/createUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({ username: username, password: password})
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
            message: message
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

function setup() {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

exports.setup = setup;

setup()