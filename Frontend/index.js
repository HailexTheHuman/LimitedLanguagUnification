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

    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'password') {
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

app.get('/main', async (req, res) => {
    const user = await fetch('http://localhost:3001/getUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: 'admin' })
    });
    res.render('main', {user: await user.json()});
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});