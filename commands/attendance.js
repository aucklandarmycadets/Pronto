const dateFormat = require('dateformat');
const modules = require('../modules');

module.exports = {
    name: 'attendance',
    description: 'Submit an attendance register.',
    execute(Discord, bot, msg, args) {
        if (!msg.member.roles.cache.some(roles=>modules.constObj.tacPlus.includes(roles.id))) {
            bot.commands.get('help').execute(Discord, bot, msg, args);
            return;
        }

        if (args.length === 0) {
            msg.react(bot.emojis.cache.find(emoji => emoji.name === modules.constObj.errorEmoji));
            errorEmbed = new Discord.MessageEmbed()
                .setColor(modules.constObj.error)
                .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
                .setDescription(`${msg.author} You must enter a message. ${modules.helpObj.errorAttendance}`);
            msg.channel.send(errorEmbed);
        }

        else {
            msg.delete();

            formationColour = modules.constObj.grey;
            formationName = msg.guild.name;

            for (const [index, role] of Object.entries(msg.member.roles.cache.array())) {
                if (modules.constObj.formations.includes(role.id)) {
                    formationColour = role.color;
                    formationName = role.name;
                }
            }

            attendanceEmbed = new Discord.MessageEmbed()
            .setColor(formationColour)
            .setAuthor(`${formationName} (${msg.member.displayName})`, msg.guild.iconURL())
            .setDescription(`${args.join(' ')}`)
            .setFooter(`${dateFormat(msg.createdAt.toString(), 'HHMM "h" ddd, dd mmm yy')}`);

            bot.channels.cache.get(modules.constObj.attendanceID).send(attendanceEmbed);
            msg.channel.send(attendanceEmbed);
        }
    },
};