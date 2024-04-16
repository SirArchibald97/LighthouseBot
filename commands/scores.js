const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { getFormattedTeamName, getPlacementString, cycleEmbeds, getTeamEmoji, getPrettyGameName, getErrorEmbed } = require("../utils.js");
const ErrorType = require("../types/ErrorType.js");

module.exports = {
    local: false,
    data: new SlashCommandBuilder().setName("scores").setDescription("View scores and placements of the last MCC!")
        .addSubcommand(teams => teams.setName("teams").setDescription("View scores and team placements of the last MCC!"))
        .addSubcommand(players => players.setName("players").setDescription("View scores and individual placements of the last MCC!"))
        .addSubcommand(games => games.setName("games").setDescription("View scores and team placements of each gamemode from the last MCC!")),

    async execute(client, interaction) {
        await interaction.deferReply();

        const rundownResponse = await fetch("https://api.mcchampionship.com/v1/rundown");
        const { code: rd_code, data: rd_data } = await rundownResponse.json();
        if (rd_code !== 200) return interaction.editReply({ embeds: [getErrorEmbed(ErrorType.NO_API_RES)], ephemeral: true });
        
        const eventResponse = await fetch("https://api.mcchampionship.com/v1/event");
        const { code: e_code, data: e_data } = await eventResponse.json();
        if (e_code !== 200) return interaction.editReply({ embeds: [getErrorEmbed(ErrorType.NO_API_RES)], ephemeral: true });

        const eventNumber = new Date(e_data.date).getTime() < new Date().getTime() ? e_data.event : e_data.event - 1;

        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "teams") {
            const embeds = [];
            const placements = Object.entries(rd_data.eventPlacements).sort((a, b) => a[1] - b[1]), scores = rd_data.eventScores, teams = rd_data.creators;

            const embed = new EmbedBuilder().setTitle(`<:trophy:1133375484021981306> MCC ${eventNumber}: Team Leaderboard`).setColor("Red").setFooter({ text: "Powered by Alex!", iconURL: client.user.avatarURL() }).setTimestamp();
            let desc = "";
            let counter = 0;
            for (const [team, placement] of placements) {
                desc += `### ${getPlacementString(placement)} ${getTeamEmoji(team)} ${getFormattedTeamName(team)}: \`${scores[team].toLocaleString()}\`\n`;
                for (const player of teams[team]) desc += `**${player}** : \`${rd_data.individualScores[player].toLocaleString()}\` points\n`;
                counter++;

                if (counter === 3) {
                    embeds.push(EmbedBuilder.from(embed).setDescription(desc));
                    desc = "";
                    counter = 0;
                }
            }
            if (desc.length > 0) embeds.push(EmbedBuilder.from(embed).setDescription(desc));

            await cycleEmbeds(interaction, embeds);

        } else if (subcommand === "players") {
            const embeds = [];
            const players = Object.entries(rd_data.individualScores).sort((a, b) => b[1] - a[1]), teams = rd_data.creators;

            const embed = new EmbedBuilder().setTitle(`<:trophy:1133375484021981306> MCC ${eventNumber}: Player Leaderboard`).setColor("Red").setFooter({ text: "Powered by Alex!", iconURL: client.user.avatarURL() }).setTimestamp();
            let desc = "";
            let counter = 0;
            let position = 0;
            for (const [player, score] of players) {
                const team = Object.entries(teams).find(([team, members]) => members.includes(player))[0];
                desc += `**${getPlacementString(position)} ${getTeamEmoji(team)} ${player}**: \`${score.toLocaleString()} points\`\n`
                counter++;
                position++;

                if (counter === 10) {
                    embeds.push(EmbedBuilder.from(embed).setDescription(desc));
                    desc = "";
                    counter = 0;
                }
            }
            if (desc.length > 0) embeds.push(EmbedBuilder.from(embed).setDescription(desc));

            await cycleEmbeds(interaction, embeds);

        } else if (subcommand === "games") {
            const embeds = [];

            const dodgebolt = rd_data.dodgeboltData;
            let desc = [];
            for (const [team, score] of Object.entries(dodgebolt)) desc.push(`${getTeamEmoji(team)} ${getFormattedTeamName(team)}: \`${score}\``);
            embeds.push(new EmbedBuilder().setTitle(`<:crown:1135963205328453663> MCC ${eventNumber}: Dodgebolt Results`).setDescription("### " + desc.join(" vs. ")).setColor("Red").setFooter({ text: "Powered by Alex!", iconURL: client.user.avatarURL() }).setTimestamp());

            for (const game of Object.values(rd_data.history)) {
                const teamPlacements = Object.entries(game.gamePlacements).sort((a, b) => a[1] - b[1]);
                let desc = `Game Multiplier: \`x${game.multiplier}\`\n\n`;
                for (const [team, placement] of teamPlacements) {
                    desc += `**${getPlacementString(placement)} ${getTeamEmoji(team)} ${getFormattedTeamName(team)}**: \`${game.gameScores[team].toLocaleString()}\`\n`;
                }

                embeds.push(new EmbedBuilder()
                    .setTitle(`<:crown:1135963205328453663> MCC ${e_data.event}: Game #${game.index + 1}: ${getPrettyGameName(game.game) || game.game}`)
                    .setDescription(desc)
                    .setFooter({ text: "Powered by Alex!", iconURL: client.user.avatarURL() }).setTimestamp().setColor("Red")
                );
            }

            const selectMenu = new StringSelectMenuBuilder().setCustomId("results-select").setPlaceholder("Select a game to view results").setMinValues(1).setMaxValues(1);
            let counter = 1;
            selectMenu.addOptions({ label: "Dodgebolt", value: "0" });
            for (const game of Object.values(rd_data.history)) {
                selectMenu.addOptions({ label: getPrettyGameName(game.game) || game.game, value: counter.toLocaleString() });
                counter++;
            }
            const reply = await interaction.editReply({ embeds: [embeds[0]], components: [new ActionRowBuilder().addComponents(selectMenu)], fetchReply: true });
            const filter = i => i.member.id === interaction.member.id;
            const collector = reply.createMessageComponentCollector({ filter: filter, time: 60_000 * 5 });
            collector.on("collect", async i => {
                await i.update({ embeds: [embeds[i.values[0]]] });
            });
            collector.on("end", async collected => {
                await reply.edit({ components: [new ActionRowBuilder().addComponents(StringSelectMenuBuilder.from(selectMenu).setDisabled(true))] });
            });
            
        }
    },
}