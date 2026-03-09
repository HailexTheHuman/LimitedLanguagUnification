const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');
require('dotenv').config();









//const hiddenInfo = JSON.parse(fs.readFileSync("../../hiddenInformation.json", "utf8"));
//const password = hiddenInfo.mongo_password


const password = process.env.MONGO_PASS;
/**
 * this is the connection string for the mongo database
 * @type {string}*/
const uri = `mongodb+srv://cterry_db_user:${password}@cluster0.rqbyqym.mongodb.net/?appName=Cluster0`;


/**
 * this is the client for the mongo database
 * @type {MongoClient}*/
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

/**
 * this is a test function to test the connection to the database.
 * it is copied from the mongo docs.
 * will print a message to console if successful
 * <br>
 * use {@link callMongo} to safely call this function
 * @returns {Promise<void>}
 */
async function testConnection() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("LLU").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

/**
 * this is a function to create a new user and add them to the database
 * <br>
 * use {@link callMongo} to safely call this function
 * @param {string} username the username of the user
 * @param {string} password the hashed and salted password of the user
 * @param {string} email the email of the user
 * @param {boolean} isVerified whether the user has verified their email
 * @param {string} verificationCode the hashed and salted verification code of the user
 * @returns {Promise<Document & {_id: InferIdType<Document>}>}
 */
async function createUser(username, password, email, isVerified, verificationCode) {
    try {
        await client.connect();
        const newUser = {
            username: username,
            password: password,
            email: email,
            isVerified: isVerified,
            verificationCode: verificationCode,
            conversations: []
        }
        await client.db("LLU").collection("users").insertOne(newUser);
        return await client.db("LLU").collection("users").findOne({username: username});
    } finally {
        await client.close();
    }
}


/**
 * this is a function to verify a new user
 * <br>
 * use {@link callMongo} to safely call this function
 * @param {string} username the username of the user
 */
async function verifyByUsername(username) {
    try {
        await client.connect();
    await client.db("LLU").collection("users").updateOne(
        { username: username },
        { $set: { isVerified: true } }
    );
    } finally {
        await client.close();
    }
}

/**
 * this is a function to get all users from the database; it is intended for testing purposes.
 * <br>
 * use {@link getUserByUsername} to get a specific user
 * <br>
 * this function will print all users to the console
 * <br>
 * use {@link callMongo} to safely call this function
 * @returns {Promise<void>}
 */
async function getUsers() {
    try {
        await client.connect();
        console.log(await client.db("LLU").collection("users").find().toArray());
    } finally {
        await client.close();
    }
}

/**
 * this is a function to get a specific user from the database
 * <br>
 * use {@link callMongo} to safely call this function
 * @param {string} username the username of the user to get
 * @returns {Promise<Document & {_id: InferIdType<Document>}>} a promise that resolves to the user document
 */
async function getUserByUsername(username) {
    try {
        await client.connect();
        return await client.db("LLU").collection("users").findOne({username: username});
    } finally {
        await client.close();
    }
}

/**
 * this function sets the conversation history of a user, you should validate the password before calling this function
 * <br>
 * use {@link callMongo} to safely call this function
 *
 * @param {string} username the username of the user to set the conversation history for
 * @param {Array[Object]} conversation an array of conversations to be set
 * @returns {Promise<{sucess: boolean}>} a promise that resolves to an object containing a success flag
 */
async function setConversationHistory(username, conversation) {
    try {
        await client.connect();
        await client.db("LLU").collection("users").updateOne({username: username}, {$set: {conversations: conversation}});
        return {sucess: true};
    } finally {
        await client.close();
        return {sucess: false};
    }
}

/**
 * this function gets a response from the openrouter api.
 * it will access a given model with the given parameters and return the response.
 * @param {Array[Object]} conversation an array of messages to be used as context for the response
 * @param {string} prompt the prompt to be used for the response, will be appended to the end of the conversation
 * @param {string} model the model to get the response from
 * @param {string} responsePrefix a prefix to be added to the beginning of the model's response. will be appended to the end of the conversation
 * @param {Object} params additional parameters to be passed to the model
 * @param {string} role the role taken when prompting the model, can be "user", "system", or "model"
 * @returns {Promise<{message: string}>} a promise that resolves to an object containing the response from the model
 */
async function getResponse(conversation, prompt, model, responsePrefix="", params={}, role="user") {
    let context = []

    for (const message of conversation) {
        context.push({
            role: message.sender === "model" ? "assistant" : ( message.sender === "system" ? "system" : "user"),
            content: message.text
        })
    }

    context.push({
        role: role === "model" ? "assistant" : ( role === "system" ? "system" : "user"),
        content: prompt
    })
    if (responsePrefix !== "") context.push(
        {
            role: "assistant",
            content: responsePrefix
        }
    )

    let fetchParams = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPEN_ROUTER}`,
            'Content-Type': 'application/json',
        },
        body: {
            model: model,
            //max_tokens: 100,
            messages: context
        },
    }

    for (const [key, value] of Object.entries(params)) {
        fetchParams.body[key] = value;
    }


    fetchParams.body = JSON.stringify(fetchParams.body, null, 2);
    console.log(fetchParams.body);


    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', fetchParams);
    if (res.status !== 200) {
        return {message:"A problem occured, error code: " + res.status + ""}
    }
    const jsonRes = await res.json();
    const message = responsePrefix + jsonRes.choices[0].message.content;
    return { message };
}

/**
 * this is a promise that is used as a queue to prevent multiple calls to the mongo database at the same time.
 * @type {Promise<void>}
 */
let lastCall = Promise.resolve();

/**
 * this is a function to safely call the mongo database.
 * it will prevent multiple calls to the mongo database at the same time.
 * you should use this function as a wrapper around all calls to the mongo database.
 *
 *
 * @param {Function} method the method to call on the mongo database
 * @param {Array} params the parameters to pass to the method, in order
 * @returns {Promise<*>} a promise that resolves to the result of the method called
 */
function callMongo(method, params) {
    const run = lastCall.then(() => method(...params));
    lastCall = run.catch(() => {});
    return run;
}

/**
 * a function to get all models from the openrouter api.
 * the models it returns are used to generate responses from the {@link getResponse} function.
 *
 * @returns {Promise<*[]>} a promise that resolves to an array of model objects, each object is as follows: <br>
 * {<br>
 *     id: String,
 *     name: String,
 *     description: String,
 *     isFree: boolean
 * }
 */
async function getModels() {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/models", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.OPEN_ROUTER}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = (await response.json()).data;

        const returnData = [];
        for (const model of data) {
            returnData.push({
                id: model.id,
                name: model.name,
                description: model.description,
                isFree: (model.pricing.prompt === '0' && model.pricing.completion === '0')
            });
        }
        console.log("DAL: " + JSON.stringify(returnData[0]));
        return returnData;
    } catch (error) {
        console.error("Error fetching models:", error);
        throw error;
    }
}






exports.testConnection = testConnection;
exports.createUser = createUser;
exports.getUsers = getUsers;
exports.getUserByUsername = getUserByUsername;
exports.getResponse = getResponse;
exports.setConversationHistory = setConversationHistory;
exports.callMongo = callMongo;
exports.getModels = getModels;
exports.verifyByUsername = verifyByUsername;

//testConnection();


//getResponse([], "what is cake?", 'openrouter/free', '', {max_tokens:10}).then(console.log);
