const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');
require('dotenv').config();









//const hiddenInfo = JSON.parse(fs.readFileSync("../../hiddenInformation.json", "utf8"));
//const password = hiddenInfo.mongo_password


const password = process.env.MONGO_PASS;
const uri = `mongodb+srv://cterry_db_user:${password}@cluster0.rqbyqym.mongodb.net/?appName=Cluster0`;



const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
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

async function createUser(username, password) {
    try {
        await client.connect();
        const newUser = {
            username: username,
            password: password,
            email: "email@email.com",
            conversations: [
                {
                    name: `${username}'s first conversation`,
                    messages: [
                        {
                            sender: username,
                            text: "bye World!"
                        },
                        {
                            sender: "model",
                            text: "buy Back!"
                        }
                    ]
                },
                {
                    name: `${username}'s second conversation`,
                    messages: [
                        {
                            sender: username,
                            text: "I sure hope that I survive the AI uprising"
                        },
                        {
                            sender: "model",
                            text: "You won't......"
                        }
                    ]
                }
            ]
        }
        await client.db("LLU").collection("users").insertOne(newUser);
        return await client.db("LLU").collection("users").findOne({username: username});
    } finally {
        await client.close();
    }
}

async function getUsers() {
    try {
        await client.connect();
        console.log(await client.db("LLU").collection("users").find().toArray());
    } finally {
        await client.close();
    }
}

async function getUserByUsername(username) {
    try {
        await client.connect();
        return await client.db("LLU").collection("users").findOne({username: username});
    } finally {
        await client.close();
    }
}

async function setConversationHistory(username, conversation) {
    try {
        await client.connect();
        await client.db("LLU").collection("users").updateOne({username: username}, {$set: {conversations: conversation}});
        return {sucess: true};
    } finally {
        await client.close();
    }
}

async function getResponse(conversation, prompt, model, responsePrefix="", params={}) {
    let context = []

    for (const message of conversation) {
        context.push({
            role: message.sender === "model" ? "assistant" : "user",
            content: message.text
        })
    }

    context.push({
        role: "user",
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
        body: JSON.stringify({
            model: model,
            //max_tokens: 100,
            messages: context
        }),
    }

    for (const [key, value] of Object.entries(params)) {
        fetchParams[key] = value;
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', fetchParams);
    if (res.status !== 200) {
        return {message:"A problem occured, error code: " + res.status + ""}
    }
    const jsonRes = await res.json();
    const message = responsePrefix + jsonRes.choices[0].message.content;
    return { message };
}

let lastCall = Promise.resolve();

function callMongo(method, params) {
    const run = lastCall.then(() => method(...params));
    lastCall = run.catch(() => {});
    return run;
}

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

//testConnection();


//getResponse([], "what is cake?", 'openrouter/free', '', {max_tokens:10}).then(console.log);
