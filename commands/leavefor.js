const dateFormat = require('dateformat');
const modules = require('../modules');

const leaveForEmbedTitle = 'Leave Request (For)';

module.exports = {
    name: modules.cmdList.leaveForCmd,
    description: modules.cmdTxt.leaveForDesc,
    execute(Discord, bot, msg, args) {
        'use strict';

        if (!msg.member.roles.cache.some(roles => modules.constObj.tacPlus.includes(roles.id))) {
            bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);
            return;
        }

        if (msg.mentions.members.size === 0) {
            modules.sendErrorEmbed(Discord, bot, msg, 'You must tag a user.', modules.helpObj.errorLeaveFor);
        }

        else if (msg.mentions.members.some(mention => mention.user.bot)) {
            modules.sendErrorEmbed(Discord, bot, msg, 'You cannot submit leave for a bot!', modules.helpObj.errorLeaveFor);
        }

        else if (msg.mentions.members.size > 1) {
            modules.sendErrorEmbed(Discord, bot, msg, 'You must submit leave individually.', modules.helpObj.errorLeaveFor);
        }

        else if (args.length < 2) {
            modules.sendErrorEmbed(Discord, bot, msg, 'Insufficient arguments.', modules.helpObj.errorLeaveFor);
        }

        else {
            msg.react(msg.guild.emojis.cache.find(emoji => emoji.name === modules.constObj.successEmoji))
                .catch(error => modules.debugError(Discord, bot, error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

            const mentionIndex = args.indexOf(`<@!${msg.mentions.members.first().user.id}>`);

            if (mentionIndex > -1) args.splice(mentionIndex, 1);

            const attendanceEmbed = new Discord.MessageEmbed()
                .setTitle(leaveForEmbedTitle)
                .setColor(modules.constObj.red)
                .setAuthor(msg.mentions.members.first().displayName, msg.mentions.members.first().user.displayAvatarURL())
                .setDescription(`${msg.author} has submitted leave for ${msg.mentions.members.first()} in ${msg.channel}`)
                .addFields(
                    { name: 'Date', value: dateFormat(msg.createdAt, modules.constObj.dateOutput) },
                    { name: 'Absentee', value: msg.mentions.members.first() },
                    { name: 'Details', value: modules.capitalise(args.join(' ')) }
                );

            const dmEmbed = new Discord.MessageEmbed()
                .setTitle(leaveForEmbedTitle)
                .setColor(modules.constObj.red)
                .setAuthor(msg.guild.name, msg.guild.iconURL())
                .setDescription(`Hi ${msg.author}, your submission of leave for ${msg.mentions.members.first()} has been received.`)
                .addFields(
                    { name: 'Date', value: dateFormat(msg.createdAt, modules.constObj.dateOutput) },
                    { name: 'Channel', value: msg.channel.toString() },
                    { name: 'Details', value: modules.capitalise(args.join(' ')) }
                );

            const absenteeEmbed = new Discord.MessageEmbed()
                .setTitle(leaveForEmbedTitle)
                .setColor(modules.constObj.red)
                .setAuthor(msg.guild.name, msg.guild.iconURL())
                .setDescription(`${msg.author} has submitted leave for you in ${msg.channel}.`)
                .addFields(
                    { name: 'Date', value: dateFormat(msg.createdAt, modules.constObj.dateOutput) },
                    { name: 'Channel', value: msg.channel.toString() },
                    { name: 'Details', value: modules.capitalise(args.join(' ')) }
                )
                .setFooter(`Reply with ${modules.constObj.prefix}${modules.cmdList.helpCmd} ${modules.cmdList.leaveCmd} to learn how to request leave for yourself.`);

            bot.channels.cache.get(modules.constObj.attendanceID).send(attendanceEmbed);
            msg.author.send(dmEmbed).catch(error => modules.dmError(Discord, bot, msg));
            msg.mentions.members.first().send(absenteeEmbed).catch(error => modules.dmError(Discord, bot, msg, true));
        }
    },
};