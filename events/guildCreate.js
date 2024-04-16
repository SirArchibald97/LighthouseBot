const { addGuild, getGuild } = require("../api");

module.exports = async (client, newGuild) => {    
    const guild = await getGuild(client, newGuild.id);
    if (!guild) await addGuild(client, newGuild.id);
}