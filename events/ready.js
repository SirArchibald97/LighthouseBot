const { Collection, EmbedBuilder, ActivityType } = require("discord.js");
const fs = require("fs");
const cron = require("node-cron");

module.exports = async (client) => {
    // client is ready
    console.log(`Client connected! [${client.user.tag}]`);
    const guilds = await client.guilds.fetch();
    console.log(`Listening in ${guilds.size} guilds...`);

    // deploy slash commands
    const deploy = require("../deploy");
    await deploy(client);

    // load buttons
    client.buttons = new Collection();
    const buttonFiles = fs.readdirSync(__dirname + "/../buttons/");
    for (let file of buttonFiles) {
        let button = require(__dirname + `/../buttons/${file}`);
        client.buttons.set(file.split(".")[0], button);
    }
    
    // set random prescence
    const prescences = [
        "Sky Battle", "Battle Box", "Dodgebolt", "Hole in the Wall", "Parkour Tag", "Rocket Spleef Rush", "Ace Race", 
        "Parkour Warrior", "Buildmart", "Sands of Time", "Survival Games", "Gridrunners", "TGTTOS", "Meltdown"
    ];
    await client.user.setActivity({ name: prescences[Math.floor(Math.random() * prescences.length - 1) + 1], type: ActivityType.Playing, url: "https://alex.sirarchibald.dev" });
    setInterval(async () => {
        await client.user.setActivity({ name: prescences[Math.floor(Math.random() * prescences.length - 1) + 1], type: ActivityType.Playing, url: "https://alex.sirarchibald.dev" });
    }, 60_000 * 5);
}