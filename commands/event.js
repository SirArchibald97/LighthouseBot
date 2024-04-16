const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getErrorEmbed } = require("../utils");
const ErrorType = require("../types/ErrorType");

module.exports = {
    local: false,
    data: new SlashCommandBuilder().setName("event").setDescription("View MCC event details of the current event cycle"),

    async execute(client, interaction) {
        await interaction.deferReply();

        // fetch event data
        const eventResponse = await fetch("https://api.mcchampionship.com/v1/event");
        const { code, data } = await eventResponse.json();

        if (code !== 200) return interaction.reply({ embeds: [getErrorEmbed(ErrorType.NO_API_RES)], ephemeral: true });

        // convert event date to timestamp
        const eventDate = new Date(data.date);
        const eventTimestamp = eventDate.getTime();

        // create embed
        const eventEmbed = new EmbedBuilder()
            .setTitle(`<:crown:1135963205328453663> ${eventTimestamp > Date.now() ? "Next" : "Previous"} MCC`)
            .setDescription(
                `The ${eventTimestamp > Date.now() ? "next" : "previous"} event **MCC ${data.event}** ${eventTimestamp > Date.now() ? "will be" : "was"} on <t:${eventTimestamp / 1000}> (<t:${eventTimestamp / 1000}:R>)` +
                `\n\n🎞️ Watch the ${data.updateVideo ? `(update video)[${data.updateVideo}]` : "update video"}!\n🐦 Follow [@MCChampionship_](https://twitter.com/MCChampionship_) on Twitter for updates!`
            )
            .setColor("Red")
            .setTimestamp()
            .setFooter({ text: `Powered by Alex!`, iconURL: client.user.avatarURL() });

        // send embed
        await interaction.editReply({ embeds: [eventEmbed] });
    }
}