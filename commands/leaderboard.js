const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getRankEmoji, getIslandGameEmoji, getPrettyIslandGame } = require("../utils");

module.exports = {
    local: false,
    data: new SlashCommandBuilder().setName("leaderboard").setDescription("See the top 10 players in 80+ stats!")
        .addStringOption(game => game.setName("game").setDescription("The game to view leaderboards for").setRequired(false).addChoices(
            { name: "Miscellaneous", value: "misc" },
            { name: "Sky Battle", value: "sky_battle.quads" },
            { name: "Battle Box", value: "battle_box" },
            { name: "TGTTOS", value: "tgttos" },
            { name: "HITW", value: "hitw" },
            { name: "Dynaball", value: "dynaball" },
            { name: "PKW Dojo", value: "pkw.dojo" },
            { name: "PKW Survivor", value: "pkw.survivor" },
        )
    ),

    async execute(client, interaction) {
        await interaction.deferReply();

        const game = interaction.options.getString("game") || "misc";
        let results;
        if (game === "misc")
            results = await client.stats.collection("players")
                .find({ $and: [{ "player.statistics": { $exists: true } }, { "player.collections": { $exists: true } }] })
                .project({ uuid: 1, "player.username": 1, "player.ranks": 1, "player.collections.currency.royalReputation": 1, "player.statistics.games_played": 1 })
                .toArray();
        else
            results = await client.stats.collection("players")
                .find({ "player.statistics": { $exists: true } })
                .project({ uuid: 1, "player.username": 1, "player.ranks": 1, [`player.statistics.${game}`]: 1 })
                .toArray();

        const leaderboards = {};
        for (const stat of stats[game]) {
            const sortedResults = results.sort((a, b) => fetchStat(b.player, stat.value) - fetchStat(a.player, stat.value));

            let leaderboardList = "";

            let pageCounter = 0;
            let pages = [];
            for (let entry of sortedResults) {
                leaderboardList += `### #${sortedResults.indexOf(entry) + 1} ${getRankEmoji(entry.player.ranks)} **${entry.player.username}**: \`${fetchStat(entry.player, stat.value)}\`\n`;
                pageCounter++;

                if (pageCounter === 10) {
                    pageCounter = 0;
                    pages.push(new EmbedBuilder().setDescription(`# ${getIslandGameEmoji(game)} ${getPrettyIslandGame(game)} ${stat.name}\n` + leaderboardList).setColor("Green"));
                    leaderboardList = "";
                }
            }
            for (let page of pages) page.setFooter({ text: `${pages.indexOf(page) + 1}/${pages.length}` });
            leaderboards[stat.value] = pages;
        }

        const statSelector = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("stat").setPlaceholder("Select a stat to view").addOptions(stats[game].map(stat => ({ label: stat.name, value: stat.value }))));
        const pageButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("left").setEmoji("⬅").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("middle1").setLabel("\u200b").setStyle(ButtonStyle.Secondary).setDisabled(true),
            new ButtonBuilder().setCustomId("middle2").setLabel("\u200b").setStyle(ButtonStyle.Secondary).setDisabled(true),
            new ButtonBuilder().setCustomId("middle3").setLabel("\u200b").setStyle(ButtonStyle.Secondary).setDisabled(true),
            new ButtonBuilder().setCustomId("right").setEmoji("➡").setStyle(ButtonStyle.Primary)
        );

        const message = await interaction.editReply({ embeds: [leaderboards[stats[game][0].value][0]], components: [pageButtons, statSelector], fetchReply: true });
        const collector = message.createMessageComponentCollector({ filter: int => int.member.id === interaction.member.id, time: 60_000 * 5 });
        let pageIndex = 0;
        let currentStat = stats[game][0].value;
        collector.on("collect", async int => {
            if (int.isStringSelectMenu()) {
                const stat = int.values[0];
                pageIndex = 0;
                currentStat = stat;
                await int.update({ embeds: [leaderboards[stat][pageIndex]] });
            } else {
                const direction = int.customId;
                if (direction === "left") {
                    if (pageIndex > 0) 
                        pageIndex--;
                    else
                        pageIndex = leaderboards[currentStat].length - 1;

                } else {
                    if (pageIndex < leaderboards[currentStat].length - 1)
                        pageIndex++;
                    else
                        pageIndex = 0;
                }
                await int.update({ embeds: [leaderboards[currentStat][pageIndex]] });
            }
        });
        collector.on("end", async collected => {
            await message.edit({ components: [] });
        });
    }
}

const stats = {
    "battle_box": [
        { name: "Team Wins", value: "statistics.battle_box.team_first_place" }, { name: "Team Losses", value: "statistics.battle_box.team_losses" }, { name: "Team WLR", value: "statistics.battle_box.team_wlr" },
        { name: "Solo Wins", value: "statistics.battle_box.solo_first_place" }, { name: "Solo Losses", value: "statistics.battle_box.solo_losses" }, { name: "Solo WLR", value: "statistics.battle_box.solo_wlr" },
        { name: "Kills", value: "statistics.battle_box.kills" }, { name: "Deaths", value: "statistics.battle_box.deaths" }, { name: "KDR", value: "statistics.battle_box.kdr" },
    ]
}

function fetchStat(player, stat) {
    const path = stat.split(".");
    let value = player;
    for (let key of path) {
        value = value[key];
    }
    return value?.toLocaleString() || "Unknown";
}