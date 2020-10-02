const dateFormat = require('dateformat');
const modules = require('../modules');

module.exports = {
    name: modules.cmdList.leaveCmd,
    description: modules.cmdTxt.leaveDesc,
    execute(Discord, bot, msg, args) {
        if (msg.member.roles.cache.some(roles=>modules.constObj.nonCadet.includes(roles.id))) {
            bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);
            return;
        }

        if (args.length === 0) {
            msg.react(bot.emojis.cache.find(emoji => emoji.name === modules.constObj.errorEmoji));

            errorEmbed = new Discord.MessageEmbed()
            .setColor(modules.constObj.error)
            .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
            .setDescription(`${msg.author} Insufficient arguments. ${modules.helpObj.errorLeave}`);
            msg.channel.send(errorEmbed);
        }

        else {
            msg.react(bot.emojis.cache.find(emoji => emoji.name === modules.constObj.successEmoji));

            attendanceEmbed = new Discord.MessageEmbed()
            .setTitle('Leave Request')
            .setColor(modules.constObj.red)
            .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
            .setDescription(`${msg.author} has requested leave in ${msg.channel}`)
            .addFields(
                { name: 'Date', value: dateFormat(msg.createdAt.toString(), 'HHMM "h" ddd, dd mmm yy') },
                { name: 'Details', value: modules.capitalise(args.join(' ')) },
            );

            dmEmbed = new Discord.MessageEmbed()
            .setTitle('Leave Request')
            .setColor(modules.constObj.red)
            .setAuthor(msg.guild.name, msg.guild.iconURL())
            .setDescription(`Hi ${msg.author}, your submission of leave has been received.`)
            .addFields(
                { name: 'Date', value: dateFormat(msg.createdAt.toString(), 'HHMM "h" ddd, dd mmm yy') },
                { name: 'Channel', value: msg.channel.toString() },
                { name: 'Details', value: modules.capitalise(args.join(' ')) },
            );

            bot.channels.cache.get(modules.constObj.attendanceID).send(attendanceEmbed);
            msg.author.send(dmEmbed);
        }
    },
};