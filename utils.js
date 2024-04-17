const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    // add dashes back into a UUID
    formatUUID: function(uuid) {
        return uuid.substr(0,8) + "-" + uuid.substr(8,4) + "-" + uuid.substr(12,4) + "-" + uuid.substr(16,4) + "-" + uuid.substr(20);
    },

    // get an array of raw team names in order
    getTeamNames: function() {
        return ["RED", "ORANGE", "YELLOW", "LIME", "GREEN", "CYAN", "AQUA", "BLUE", "PURPLE", "PINK"];
    },
    
    // get a pretty team name from a raw team name
    getFormattedTeamName: function(teamName) {
        const prettyNames = ["Red Rabbits", "Orange Ocelots", "Yellow Yaks", "Lime Llamas", "Green Geckos", "Cyan Coyotes", "Aqua Axolotyls", "Blue Bats", "Purple Panadas", "Pink Parrots", "Spectators", "None"];
        const uglyNames = ["RED", "ORANGE", "YELLOW", "LIME", "GREEN", "CYAN", "AQUA", "BLUE", "PURPLE", "PINK", "SPECTATORS", "NONE"];
        return prettyNames[uglyNames.indexOf(teamName)];
    },

    // get an rbg colour resolvable from a raw team name
    getTeamColourResolvable: function(teamName) {
        const colourResolvables = {
            "RED": [255, 85, 85], "ORANGE": [255, 170, 0], "YELLOW": [255, 255, 85], "LIME": [85, 255, 85], "GREEN": [0, 170, 0],
            "CYAN": [0, 170, 170], "AQUA": [85, 255, 255], "BLUE": [0, 0, 170], "PURPLE": [170, 0, 170], "PINK": [255, 85, 255],
            "SPECTATORS": [170, 170, 170], "NONE": [255, 255, 255]
        };
        return colourResolvables[teamName];
    },

    getTeamEmoji: function(teamName) {
        const emojis = {
            "RED": "<:red_rabbits:1135862351334215690>", "ORANGE": "<:orange_ocelots:1135862343792873502>",
            "YELLOW": "<:yellow_yaks:1135862353594945577>", "LIME": "<:lime_llamas:1135862342232580196>",
            "GREEN": "<:green_geckos:1135862339397242890>", "AQUA": "<:aqua_axolotls:1135862328815009917>", 
            "CYAN": "<:cyan_coyotes:1135862337627242567>", "BLUE": "<:blue_bats:1135862333680386058>",
            "PURPLE": "<:purple_pandas:1135862347966206002>", "PINK": "<:pink_parrots:1135862346342989824>"
        };
        return emojis[teamName];
    },

    // get a placement string from a raw position
    getPlacementString: function(position) {
        const placementStrings = { 0: "1st", 1: "2nd", 2: "3rd", 20: "21st", 21: "22nd", 22: "23rd", 30: "31st", 31: "32nd", 32: "33rd" };
        if (placementStrings[position]) {
            return placementStrings[position];
        } else {
            return `${position + 1}th`;
        }
    },

    // get a prety game name from a raw game name
    getPrettyGameName: function(gameName) {
        const uglyNames = ["MG_BATTLE_BOX", "MG_SANDS_OF_TIME", "MG_ACE_RACE", "MG_PARKOUR_WARRIOR", "MG_ROCKET_SPLEEF",
             "MG_GRID_RUNNERS", "MG_HOLE_IN_THE_WALL", "MG_SKY_BATTLE", "MG_SURVIVAL_GAMES", "MG_BUILD_MART",
             "MG_TGTTOSAWAF", "MG_MELTDOWN", "MG_PARKOUR_TAG", "MG_BINGO_BUT_FAST"];
        const prettyNames = ["Battle Box", "Sands of Time", "Ace Race", "Parkour Warrior", "Rocket Spleef", 
            "Grid Runners", "Hole in the Wall", "Sky Battle", "Survival Games", "Build Mart",
            "TGTTOSAWAF", "Meltdown", "Parkour Tag", "Bingo But Fast"];
        return prettyNames[uglyNames.indexOf(gameName)];
    },

    // get the rank emoji of a player's rank
    getRankEmoji: function(ranks) {
        const icons = { 
            "NOXCREW": "<:Noxcrew:1224105343672385546>", "MODERATOR": "<:Mod:1224105342196125806>", "CONTESTANT": "<:Contestant:1224112179230281909>", "CREATOR": "<:Creator:1224112198532595812>", 
            "GRAND_CHAMP_ROYALE": "<:GrandChampRoyale:1224105339431944313>", "GRAND_CHAMP": "<:GrandChamp:1224105340803747961>", "CHAMP": "<:Champ:1224105337762611344>",
            "DEFAULT": "<:Default:1224111764765933651>"
        };

        const rankStrings = ["NOXREW", "MODERATOR", "CONTESTANT", "CREATOR", "GRAND_CHAMP_ROYALE", "GRAND_CHAMP", "CHAMP"];
        for (let rank of rankStrings) {
            if (ranks.includes(rank)) { return icons[rank]; }
        }
        return icons["DEFAULT"];
    },

    // get a pretty Island game from a raw name
    getPrettyIslandGame(game) {
        const names = { "sky_battle": "Sky Battle", "battle_box": "Battle Box", "tgttos": "TGTTOS", "hitw": "HITW", "dynaball": "Dynaball", "pkw.dojo": "PKW Dojo", "pkw.survivor": "PKW Survivor" };
        return names[game];
    },

    // get an Island game's icon as an emoji
    getIslandGameEmoji(game) {
        const icons = { 
            "sky_battle": "<:SkyBattle:1224125276397633536>", "battle_box": "<:BattleBox:1224125269439414373>", "tgttos": "<:TGTTOS:1224125271196831845>", "hitw": "<:HITW:1224125271901212713>",
            "dynaball": "<:Dynaball:1224125273545379970>", "pkw.dojo": "<:ParkourWarrior:1224125274841419857>", "pkw.survivor": "<:ParkourWarrior:1224125274841419857>"
        };
        return icons[game];
    },

    // custom error code embed
    getErrorEmbed: function(errorCode) {
        return new EmbedBuilder().setTitle("Oops, sorry about this!").setDescription(`Something went wrong ${errorCode}, please wait a bit and try again later! If the issue persists, contact SirArchibald [here](https://mcchampionship.com/conversations/add?to=sirarchibald).`).setColor("Red");
    },

    // cycle through embeds with buttons
    cycleEmbeds: async function(interaction, embeds) {
        const leftButton = new ButtonBuilder().setCustomId("left").setEmoji("⬅").setStyle(ButtonStyle.Primary);
        const rightButton = new ButtonBuilder().setCustomId("right").setEmoji("➡").setStyle(ButtonStyle.Primary);

        const reply = await interaction.editReply({ embeds: [embeds[0]], components: [new ActionRowBuilder().addComponents(leftButton, rightButton)], fetchReply: true });
        const filter = i => i.member.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector({ filter: filter, time: 60_000 * 5 });
        let index = 0;
        collector.on("collect", async int => {
            if (int.customId === "left") {
                if (index > 0) {
                    index--;
                } else {
                    index = embeds.length - 1;
                }
            } else if (int.customId === "right") {
                if (index < embeds.length - 1) {
                    index++;
                } else {
                    index = 0;
                }
            }

            await int.update({ embeds: [embeds[index]] });
        });
        collector.on("end", async collected => {
            await reply.edit({ components: [new ActionRowBuilder().addComponents(
                ButtonBuilder.from(leftButton).setDisabled(true),
                ButtonBuilder.from(rightButton).setDisabled(true)
            )] });
        });
    }
}