const express = require('express');
const app = express();
const port = 3001;

const DAL = require('./DAL/dal');

console.log("Backend started!")

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * this is just used for testing purposes
 */
app.get("/", (req, res) => {
    res.send("Sucessfull Response!");
})


/**
 * this is the endpoint for the backend to generate a response to a prompt
 *
 * it is a post-request with the following body:
 * @param {string} context the context of the conversation
 * @param {string} prompt the prompt to generate a response to
 * @param {string} model the model to use to generate the response
 * @param {string} resPrefix the prefix to use for the response
 * @param {Object} params the parameters to use for the response
 * @param {string} role the role of the user
 * @returns {Object} the response to the prompt
 */
app.post("/generate", async (req, res) => {

    const { context, prompt, model, resPrefix, params, role} = req.body;
    const response = await DAL.getResponse(context, prompt, model, resPrefix, params, role);

    res.json(response)
})
/**
 * this is the endpoint for the backend to get a user by their username
 * it is a post-request with the following body:
 * @param {string} username the username of the user to get
 * @returns {Object} the user with the given username
 */
app.post("/getUser", async (req, res) => {
    const { username } = req.body;
    res.json(await DAL.callMongo(DAL.getUserByUsername, [username]));
})

/**
 * this is the endpoint for the backend to verify a user by their username
 * @param {string} username the username of the user to get
 * @returns {Object} the user with the given username
 */
app.post("/verifyUser", async (req, res) => {
    const { username } = req.body;
    res.json(await DAL.callMongo(DAL.verifyByUsername, [username]));
})

/**
 * this is the endpoint for the backend to create a new user
 * it is a post-request with the following body:
 * @param {string} username the username of the user to create
 * @param {string} password the password of the user to create
 * @param {string} email the email of the user to create
 * @param {boolean} isVerified whether the user is verified
 * @param {string} verificationCode the verification code of the user to create
 * @returns {Object} a confirmation that the user was created
 */
app.post("/createUser", async (req, res) => {
    const { username, password, email, isVerified, verificationCode } = req.body;
    res.json(await DAL.callMongo(DAL.createUser, [username, password, email, isVerified, verificationCode]))
})

/**
 * this is the endpoint for the backend to set the conversation history of a user
 * it is a post-request with the following body:
 * @param {string} username the username of the user to set the conversation history of
 * @param {string} password the password of the user to set the conversation history of
 * @param {Array[Object]} conversation the conversation history of the user to set
 * @returns {Object} a confirmation that the conversation history was set
 */
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

/**
 * this is the endpoint for the backend to get all the models
 * it is a post-request with no body
 * @returns {Array[Object]} all the models
 */
app.post("/getModels", async (req, res) => {
    console.log("Made it!")
    const models = await DAL.getModels()
    res.json(models);
})

/**
 * a temporary function used to set up the backend, it is not needed and can be safely removed
 */
function setup() {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}


/**
 * this pings the API to make sure it is reachable
 */
function pingAPI() {
    DAL.getModels();
    console.log("Pinged API!")
}


/**
 * this pings the database to make sure it is reachable
 */
function pingDatabase() {
    DAL.callMongo(DAL.testConnection, [])
}

exports.setup = setup;

setup()

setTimeout(pingAPI, 10000);
setTimeout(pingDatabase, 10000);

