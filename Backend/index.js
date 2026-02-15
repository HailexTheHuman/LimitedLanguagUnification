const express = require('express');
const app = express();
const port = 3001;

const DAL = require('./DAL/dal');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/generate", async (req, res) => {

    const { context, prompt, model } = req.body;
    const response = await DAL.getResponse(context, prompt, model);

    res.json(response)
})

app.post("/getUser", async (req, res) => {
    const { username } = req.body;
    res.json(await DAL.getUserByUsername(username))
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
