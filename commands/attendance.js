const dateFormat = require('dateformat');
const modules = require('../modules');

module.exports = {
    name: modules.cmdList.attendanceCmd,
    description: modules.cmdTxt.attendanceDesc,
    execute(Discord, bot, msg, args) {
        if (!msg.member.roles.cache.some(roles=>modules.constObj.tacPlus.includes(roles.id))) {
            bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);
            return;
        }

        if (args.length === 0) {
            modules.sendErrorEmbed(Discord, bot, msg, 'You must enter a message.', modules.helpObj.errorAttendance);
        }

        else {
            msg.delete().catch(error => modules.debugError(Discord, bot, error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content));

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
                .setFooter(`${dateFormat(msg.createdAt, modules.constObj.dateOutput)}`);

            bot.channels.cache.get(modules.constObj.attendanceID).send(attendanceEmbed);
            msg.channel.send(attendanceEmbed);
        }
    },
};