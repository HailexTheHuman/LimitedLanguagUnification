const express = require('express');
const app = express();
const port = 3001;

const DAL = require('./DAL/dal');

console.log("Backend started!")

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/generate", async (req, res) => {

    const { context, prompt, model, resPrefix, params} = req.body;
    const response = await DAL.getResponse(context, prompt, model, resPrefix, params);

    res.json(response)
})

app.post("/getUser", async (req, res) => {
    const { username } = req.body;
    res.json(await DAL.callMongo(DAL.getUserByUsername, [username]));
})


app.post("/createUser", async (req, res) => {
    const { username, password } = req.body;
    res.json(await DAL.callMongo(DAL.createUser, [username, password]))
})

app.post("/setConversationHistory", async (req, res) => {
    const { username, conversation } = req.body;
    res.json(await DAL.callMongo(DAL.setConversationHistory, [username, conversation]))
})


function setup() {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

exports.setup = setup;

setup()

