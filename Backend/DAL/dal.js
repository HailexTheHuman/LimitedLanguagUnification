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
                    name: "not a test conversation",
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
                    name: "oh no, not another conversation",
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

async function getResponse(context, prompt, model) {
    return {response: "I am responding!"}
}









exports.testConnection = testConnection;
exports.createUser = createUser;
exports.getUsers = getUsers;
exports.getUserByUsername = getUserByUsername;
exports.getResponse = getResponse;

//testConnection();
