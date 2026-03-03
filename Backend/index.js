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

app.post("/verifyUser", async (req, res) => {
    const { username } = req.body;
    res.json(await DAL.callMongo(DAL.verifyByUsername, [username]));
})


app.post("/createUser", async (req, res) => {
    const { username, password, email, isVerified, verificationCode } = req.body;
    res.json(await DAL.callMongo(DAL.createUser, [username, password, email, isVerified, verificationCode]))
})

app.post("/setConversationHistory", async (req, res) => {
    const { username, password, conversation } = req.body;
    const user = await DAL.callMongo(DAL.getUserByUsername, [username])
    if (user.password === password) {
        console.log("User Validated!")
        res.json(await DAL.callMongo(DAL.setConversationHistory, [username, conversation]))
    } else {
        console.log("User Was Not Validated! Securuty was tested!")
        res.json({message: "You dirty horrible person, I can't belive you would attempt such a thing, you are truly the scum of the earth"})
    }

})

app.post("/getModels", async (req, res) => {
    console.log("Made it!")
    const models = await DAL.getModels()
    res.json(models);
})


function setup() {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

exports.setup = setup;

setup()

