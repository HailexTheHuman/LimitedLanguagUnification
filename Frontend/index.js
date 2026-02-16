const express = require('express');
const app = express();
const port = 3000;


app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send('Hello World!');
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
        res.send('Login successful!');
    } else {
        let model = {
            username: username,
            password: password,
            message: 'Invalid credentials'
        };
        res.render('login', model);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});