const { SlashCommandBuilder } = require("discord.js");
const { getErrorEmbed } = require("../utils");
const ErrorType = require("../types/ErrorType");

module.exports = {
    local: false,
    data: new SlashCommandBuilder().setName("leaderboard").setDescription("See the top 10 players in 80+ stats!")
        .addStringOption(game => game.setName("game").setDescription("The game to view leaderboards for").setRequired(false).addChoices(
            { name: "Miscellaneous", value: "misc" },
            { name: "Sky Battle", value: "sky_battle.quads" },
            { name: "Battle Box", valie: "battle_box" },
            { name: "TGTTOS", value: "tgttos" },
            { name: "HITW", value: "hitw" },
            { name: "Dynaball", value: "dynaball" },
            { name: "PKW Dojo", value: "pkw.dojo" },
            { name: "PKW Survivor", value: "pkw.survivor" },
        )),

    async execute(client, interaction) {
        await interaction.deferReply();

        const game = interaction.options.getString("game") || "misc";
        const res = await fetch(`https://api.sirarchibald.dev/islandstats/leaderboard/${game}`, {
            method: "GET", headers: { "auth": process.env.API_KEY }
        });
        const { success, leaderboard } = await res.json();
        if (!success) return await interaction.editReply({ embeds: [getErrorEmbed(ErrorType.NO_API_RES)] });

        const embeds = [];

        interaction.reply({ embeds: [embed] });
    }
}

const stats = {
    "battle_box": [
        "statistics.battle_box.team_first_place", "statistics.battle_box.losses", "statistics.battle_box.wlr",
        "statistics.battle_box.kills", "statistics.battle_box.deaths", "statistics.battle_box.kdr",
    ]
}