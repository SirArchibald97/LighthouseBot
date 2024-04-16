const { Client, GatewayIntentBits } = require("discord.js");
const { config } = require("dotenv");
const { MongoClient } = require("mongodb");
const { readdirSync } = require("fs");

// load environment variables
config();

// create Discord client
const client = new Client({ intents: Object.values(GatewayIntentBits).filter(value => isNaN(value)) });
client.login(process.env.DISCORD_TOKEN);

// create MongoDB client
const mongoClient = new MongoClient(process.env.MONGO_URI);
mongoClient.connect();
client.db = mongoClient.db("alex");


// load Discord events
const eventFiles = readdirSync("./events/");
for (let file of eventFiles) {
    const event = require(`./events/${file}`);
    client.on(file.split(".")[0], event.bind(null, client));
}