const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const { formatUUID, getErrorEmbed } = require("../utils");
const ErrorType = require("../types/ErrorType");

module.exports = {
    local: false,
    data: new SlashCommandBuilder().setName("player").setDescription("Get information about the current player")
        .addStringOption(username => username.setName("username").setDescription("The username of the player").setRequired(true)),

    async execute(client, interaction) {
        const username = interaction.options.getString("username");

        const mjRes = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        const { id } = await mjRes.json();
        if (!id) { return await interaction.reply({ embeds: [
            new EmbedBuilder().setDescription(":x: I couldn't find a player with that username!").setColor("Red")
        ], ephemeral: true }); }

        try {
            const response = await fetch(`https://api.sirarchibald.dev/islandstats/${formatUUID(id)}`, { method: "GET", headers: { "Content-Type": "application/json" } });
            const { success, player } = await response.json();
            
            if (!success) return await interaction.reply({ embeds: [
                new EmbedBuilder().setDescription(":x: I couldn't find any data for that player!").setColor("Red")
            ], ephemeral: true });

            const playerEmbed = new EmbedBuilder()
                .setThumbnail(`https://crafatar.com/avatars/${formatUUID(id)}?overlay`)
                .setColor(rankColours[getRank(player.ranks)])
                .setTimestamp()
                .setFooter({ text: "Powered by Alex!", iconURL: client.user.avatarURL() });

            let content = `# ${rankIcons[getRank(player.ranks)]} ${player.username}\n`;
            if (player.status) {
                if (player.status.online) {
                    content += `:green_circle: ${player.status.server.category === "LOBBY" ? `In the ${statusIcons[player.status.server.associatedGame] + " " + statusStrings[player.status.server.associatedGame]} lobby` : `Playing ${statusIcons[player.status.server.associatedGame] + " " + statusStrings[player.status.server.associatedGame]}`}\n`;
                } else {
                    content += ":red_circle: Offline\n";
                }
                content += `Last Seen: <t:${Math.floor(new Date(player.status.lastJoin).getTime() / 1000)}>\n`;
                content += `First Joined: <t:${Math.floor(new Date(player.status.firstJoin).getTime() / 1000)}>\n`;
            }

            playerEmbed.addFields({ name: "Wallet", value: `<:Coins:1224118770629607515> ${player.collections?.currency.coins.toLocaleString() || "Unknown"}\n<:Gems:1224118771896287283> ${player.collections?.currency.gems.toLocaleString() || "Unknown"}\n<:Silver:1224118777516658795> ${player.collections?.currency.silver.toLocaleString() || "Unknown"}\n<:MaterialDust:1224118774119141397> ${player.collections?.currency.materialDust.toLocaleString() || "Unknown"}\n<:RoyalReputation:1224118776283271270> ${player.collections?.currency.royalReputation.toLocaleString() || "Unknown"}` });

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("player-status").setLabel("Status").setEmoji("🟢").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("player-stats").setLabel("Stats").setEmoji("📊").setStyle(ButtonStyle.Primary).setDisabled(!player.statistics ? true : false),
                new ButtonBuilder().setCustomId("player-party").setLabel("Party").setEmoji("🎉").setStyle(ButtonStyle.Primary).setDisabled(!player.social ? true : false),
                new ButtonBuilder().setCustomId("player-friends").setLabel("Friends").setEmoji("🤝").setStyle(ButtonStyle.Primary).setDisabled(!player.social ? true : false)
            );
            const friendsButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("player-friends-back").setLabel("Back").setEmoji("🔙").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("player-friends-null").setLabel("\u200b").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("player-friends-next").setLabel("Next").setEmoji("🔜").setStyle(ButtonStyle.Primary)
            );
            const statsMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId("player-stats-menu").setPlaceholder("Select a game").addOptions(
                    { label: "Sky Battle", value: "sky_battle" },
                    { label: "Battle Box", value: "battle_box" },
                    { label: "TGTTOS", value: "tgttos" },
                    { label: "HITW", value: "hitw" },
                    { label: "Dynaball", value: "dynaball" },
                    { label: "Parkour Warrior", value: "parkour_warrior" },
                    { label: "Parkour Warrior Survivor", value: "parkour_warrior_survivor" }
                )
            );
            const message = await interaction.reply({ 
                embeds: [playerEmbed.setDescription(content)],
                components: [buttons],
                fetchReply: true
            });

            let currentStatPage = "sky_battle";
            let currentFriendPage = 0;
            const collector = message.createMessageComponentCollector({ time: 60_000 });
            collector.on("collect", async int => {
                const page = int.customId.split("-")[1];
                if (page === "status") {
                    await int.update({ embeds: [playerEmbed.setDescription(content)], components: [buttons] });
                } else if (page === "stats") {
                    if (int.isStringSelectMenu()) {
                        currentStatPage = int.values[0];
                    }
                    await int.update({ embeds: [createStatsPages(client, player, rankColours[getRank(player.ranks)])[currentStatPage]], components: [statsMenu, buttons] });
                
                } else if (page === "party") {
                    await int.update({ embeds: [new EmbedBuilder().setDescription(":x: This feature is not yet implemented!").setColor("Red")], components: [buttons] });
                } else if (page === "friends") {
                    await int.update({ embeds: [new EmbedBuilder().setDescription(":x: This feature is not yet implemented!").setColor("Red")], components: [friendsButtons, buttons] });
                }
            });
            collector.on("end", async collected => {
                await message.edit({ components: [] });
            });
        } catch(err) {
            console.error(err);
            return await interaction.reply({ embeds: [getErrorEmbed(ErrorType.NO_API_RES)], ephemeral: true });
        }
    }
}

const rankIcons = {
    "NOXCREW": "<:Noxcrew:1224105343672385546>", 
    "MODERATOR": "<:Mod:1224105342196125806>", 
    "CONTESTANT": "<:Contestant:1224112179230281909>", 
    "CREATOR": "<:Creator:1224112198532595812>", 
    "GRAND_CHAMP_ROYALE": "<:GrandChampRoyale:1224105339431944313>", 
    "GRAND_CHAMP": "<:GrandChamp:1224105340803747961>", 
    "CHAMP": "<:Champ:1224105337762611344>",
    "DEFAULT": "<:Default:1224111764765933651>"
};
const rankColours = {
    "NOXCREW": "Red", 
    "MODERATOR": "Purple", 
    "CONTESTANT": "LuminousVividPink", 
    "CREATOR": "LuminousVividPink", 
    "GRAND_CHAMP_ROYALE": "Gold", 
    "GRAND_CHAMP": "Blue", 
    "CHAMP": "Green",
    "DEFAULT": "Grey"
};
function getRank(ranks) {
    const rankStrings = ["NOXREW", "MODERATOR", "CONTESTANT", "CREATOR", "GRAND_CHAMP_ROYALE", "GRAND_CHAMP", "CHAMP"];
    for (let rank of rankStrings) {
        if (ranks.includes(rank)) { return rank; }
    }
    return "DEFAULT";
}

const statusIcons = {
    "SKY_BATTLE": "<:SkyBattle:1224125276397633536>",
    "BATTLE_BOX": "<:BattleBox:1224125269439414373>",
    "TGTTOS": "<:TGTTOS:1224125271196831845>",
    "HITW": "<:HITW:1224125271901212713>",
    "DYNABALL": "<:Dynaball:1224125273545379970>",
    "PARKOUR_WARRIOR": "<:ParkourWarrior:1224125274841419857>",
    "PARKOUR_WARRIOR_SURVIVOR": "<:ParkourWarrior:1224125274841419857>"
};
const statusStrings = {
    "SKY_BATTLE": "Sky Battle",
    "BATTLE_BOX": "Battle Box",
    "TGTTOS": "TGTTOS",
    "HITW": "Hole in the Wall",
    "DYNABALL": "Dynaball",
    "PARKOUR_WARRIOR": "Parkour Warrior",
    "PARKOUR_WARRIOR_SURVIVOR": "Parkour Warrior Survivor"
};

function createStatsPages(client, player, colour) {
    const pages = {};
    const embed = new EmbedBuilder().setThumbnail(`https://crafatar.com/avatars/${player.uuid}?overlay`).setColor(colour).setTimestamp().setFooter({ text: "Powered by Alex!", iconURL: client.user.avatarURL() });
    
    // sky battle
    pages["sky_battle"] = embed.setDescription(`# ${rankIcons[getRank(player.ranks)]} ${player.username}`)
        .addFields(
        { name: `${statusIcons["SKY_BATTLE"]} Sky Battle`, value: `**Kills**: \`${player.statistics.sky_battle.quads.kills.toLocaleString()}\`\n**Deaths**: \`${player.statistics.sky_battle.quads.deaths.toLocaleString()}\`\n**KDR**: \`${(player.statistics.sky_battle.quads.kills / player.statistics.sky_battle.quads.deaths).toFixed(2).toLocaleString()}\``, inline: true },
        { name: "\u200b", value: `**Wins**: \`${player.statistics.sky_battle.quads.solo_first_place.toLocaleString()}\`\n**Losses**: \`${(player.statistics.sky_battle.quads.games_played - player.statistics.sky_battle.quads.solo_first_place).toLocaleString()}\`\n**WLR**: \`${(player.statistics.sky_battle.quads.solo_first_place / (player.statistics.sky_battle.quads.games_played - player.statistics.sky_battle.quads.solo_first_place)).toFixed(2).toLocaleString()}\``, inline: true },
        { name: "\u200b", value: `**Melee Kills**: \`${player.statistics.sky_battle.quads.melee_kills.toLocaleString()}\`\n**Ranged Kills**: \`${player.statistics.sky_battle.quads.ranged_kills.toLocaleString()}\`\n**Explosive Kills**: \`${player.statistics.sky_battle.quads.explosive_kills.toLocaleString()}\``, inline: true },
        { name: "\u200b", value: `**Games Played**: \`${player.statistics.sky_battle.quads.games_played.toLocaleString()}\`\n**Solo 1st Places**: \`${player.statistics.sky_battle.quads.solo_first_place.toLocaleString()}\`\n**Solo Top 3**: \`${player.statistics.sky_battle.quads.solo_top_three.toLocaleString()}\`\n**Solo Top 5**: \`${player.statistics.sky_battle.quads.solo_top_five.toLocaleString()}\``, inline: true },
    );

    return pages;
}

function createPartyPage(party, colour) {
    const embed = new EmbedBuilder()
}

function createFriendsPages(friends, colour) {
    const embed = new EmbedBuilder()
}