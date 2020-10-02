const dateFormat = require('dateformat');
const modules = require('../modules');

module.exports = {
    name: modules.cmdList.leaveForCmd,
    description: modules.cmdTxt.leaveForDesc,
    execute(Discord, bot, msg, args) {
        sendError = false;

        if (!msg.member.roles.cache.some(roles=>modules.constObj.tacPlus.includes(roles.id))) {
            bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);
            return;
        }

        if (msg.mentions.members.size === 0) {
            errorMessage = 'You must tag a user.';
            sendError = true;
        }

        else if (msg.mentions.members.some(mention => mention.user.bot === true)) {
            errorMessage = ' You cannot submit leave for a bot!';
            sendError = true;
        }

        else if (msg.mentions.members.size > 1) {
            errorMessage = 'You must submit leave individually.';
            sendError = true;
        }

        else if (args.length < 2) {
            errorMessage = 'Insufficient arguments.';
            sendError = true;
        }

        else {
            msg.react(bot.emojis.cache.find(emoji => emoji.name === modules.constObj.successEmoji));

            mentionIndex = args.indexOf(`<@!${msg.mentions.members.first().user.id}>`);

            if (mentionIndex > -1) {
                mention = args.splice(mentionIndex, 1);
            }

            attendanceEmbed = new Discord.MessageEmbed()
                .setTitle('Leave Request (For)')
                .setColor(modules.constObj.red)
                .setAuthor(msg.mentions.members.first().displayName, msg.mentions.members.first().user.displayAvatarURL())
                .setDescription(`${msg.author} has submitted leave for ${msg.mentions.members.first()} in ${msg.channel}`)
                .addFields(
                    { name: 'Date', value: dateFormat(msg.createdAt.toString(), 'HHMM "h" ddd, dd mmm yy') },
                    { name: 'Absentee', value: msg.mentions.members.first() },
                    { name: 'Details', value: modules.capitalise(args.join(' ')) },
            );
            
            dmEmbed = new Discord.MessageEmbed()
                .setTitle('Leave Request (For)')
                .setColor(modules.constObj.red)
                .setAuthor(msg.guild.name, msg.guild.iconURL())
                .setDescription(`Hi ${msg.author}, your submission of leave for ${msg.mentions.members.first()} has been received.`)
                .addFields(
                    { name: 'Date', value: dateFormat(msg.createdAt.toString(), 'HHMM "h" ddd, dd mmm yy') },
                    { name: 'Channel', value: msg.channel.toString() },
                    { name: 'Details', value: modules.capitalise(args.join(' ')) },
            );

            absenteeEmbed = new Discord.MessageEmbed()
                .setTitle('Leave Submission (For)')
                .setColor(modules.constObj.red)
                .setAuthor(msg.guild.name, msg.guild.iconURL())
                .setDescription(`${msg.author} has submitted leave for you in ${msg.channel}.`)
                .addFields(
                    { name: 'Date', value: dateFormat(msg.createdAt.toString(), 'HHMM "h" ddd, dd mmm yy') },
                    { name: 'Channel', value: msg.channel.toString() },
                    { name: 'Details', value: modules.capitalise(args.join(' ')) },
                )
                .setFooter(`Reply with ${modules.constObj.prefix${}modules.cmdList.helpCmd} ${modules.cmdList.leaveCmd} to learn how to request leave for yourself.`);

            bot.channels.cache.get(modules.constObj.attendanceID).send(attendanceEmbed);
            msg.author.send(dmEmbed);
            msg.mentions.members.first().send(absenteeEmbed);
        }

        if (sendError === true) {
            msg.react(bot.emojis.cache.find(emoji => emoji.name === modules.constObj.errorEmoji));
            errorEmbed = new Discord.MessageEmbed()
                .setColor(modules.constObj.error)
                .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
                .setDescription(`${msg.author} ${errorMessage} ${modules.helpObj.errorLeaveFor}`);
            msg.channel.send(errorEmbed);
        }
    },
};