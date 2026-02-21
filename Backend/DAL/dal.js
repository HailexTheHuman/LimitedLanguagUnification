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

async function insertDummyUser() {
    try {
        await client.connect();
        const dummyUser = {
            username: "user",
            password: "password",
            email: "email@email.com",
            conversations: [
                {
                    name: "test conversation",
                    messages: [
                        {
                            sender: "user",
                            test: "Hello World!"
                        },
                        {
                            sender: "model",
                            text: "Hello Back!"
                        }
                    ]
                },
                {
                    name: "another conversation",
                    messages: [
                        {
                            sender: "user",
                            text: "how many plumbers does it take to change a light bulb?"
                        },
                        {
                            sender: "model",
                            text: "I have no idea."
                        }
                    ]
                }
            ]
        }
        await client.db("LLU").collection("users").insertOne(dummyUser);
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

exports.testConnection = testConnection;
exports.insertDummyUser = insertDummyUser;
exports.getUsers = getUsers;
exports.getUserByUsername = getUserByUsername;
exports.getResponse = getResponse;

//testConnection();


//getResponse([], "what is cake?", 'openrouter/free', '', {max_tokens:10}).then(console.log);