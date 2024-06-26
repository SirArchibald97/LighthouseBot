const get = async (client, url) => {
    const res = await fetch(url, { method: "GET", headers: client.config.api_headers });
    return await res.json();
}

const post = async (client, url, data) => {
    const res = await fetch(url, { method: "POST", headers: client.config.api_headers, body: JSON.stringify(data) });
    return await res.json();
}

module.exports = {
    // GUILDS
    addGuild: async function(client, guildId) { return await post(client, `${client.config.api_url}/alex/guilds/new`, { guild_id: guildId }); },
    getGuild: async function(client, guildId) { return (await get(client, `${client.config.api_url}/alex/guilds/${guildId}`)).guild; },
    updateGuild: async function(client, guildId, newSettings) { return await post(client, `${client.config.api_url}/alex/guilds/${guildId}`, { settings: newSettings }); },
    getGuilds: async function(client) { return (await get(client, `${client.config.api_url}/alex/guilds`)).guilds; },

    // COSMETICS
    getBadges: async function(client) { return await get(client, `${client.config.api_url}/alex/badges`); },
    getCosmetics: async function(client, query) { return await get(client, `${client.config.api_url}/alex/cosmetics/${query}`); },
    getCosmeticsByNpc: async function(client, npcId) { return await get(client, `${client.config.api_url}/alex/npcs/${npcId}/cosmetics`); },

    getNpc: async function(client, npcId) { return await get(client, `${client.config.api_url}/alex/npcs/${npcId}`); },
    findNpc: async function(client, query) { return await get(client, `${client.config.api_url}/alex/npcs/find/${query}`); },
}