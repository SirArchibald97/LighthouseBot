const { Collection, Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
const fs = require("fs");

module.exports = async (client) => {
    let commands = [];
    client.commands = new Collection();
    const commandFiles = fs.readdirSync("./commands/");
    for (let file of commandFiles) {
        if (!file.endsWith(".js")) break;
        let command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
        console.log("Refreshing commands...");
        const localCommands = commands.filter((command) => command.local);
        await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: localCommands });
        const globalCommands = commands.filter((command) => !command.local);
        await rest.put(Routes.applicationCommands(client.user.id), { body: globalCommands });
        console.log("Done!");
    } catch (err) {
        console.error(err);
    }
}