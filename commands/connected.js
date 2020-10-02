const dateFormat = require('dateformat');
const modules = require('../modules');

module.exports = {
    name: '!connected',
    description: 'List of members connected to a voice channel.',
    execute(Discord, bot, botcmds, msg, args) {
        sendError = false;

        if (!msg.member.roles.cache.some(roles=>modules.constObj.sgtPlus.includes(roles.id))) {
            bot.commands.get('!help').execute(Discord, bot, botcmds, msg, args);
            return;
        }

        if (msg.mentions.channels.size === 0) {
            errorMessage = 'You must specify a channel.';
            sendError = true;
        }

        else if (msg.mentions.channels.some(mention => mention.type !== 'voice')) {
            errorMessage = 'Input must be a voice channel.';
            sendError = true;
        }

        else if (msg.mentions.channels.size > 1) {
            errorMessage = 'You must export channels individually.';
            sendError = true;
        }

        else {
            msg.react(bot.emojis.cache.find(emoji => emoji.name === modules.constObj.successEmoji));

            connectedMembers = [];

            for (const [index, member] of Object.entries(msg.mentions.channels.first().members.array())) {
                connectedMembers.push(member.toString());
            }

            connectedEmbed = new Discord.MessageEmbed()
                .setTitle(`Members Connected to #${msg.mentions.channels.first().name}`)
                .setColor(modules.constObj.success)
                .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
                .setDescription(connectedMembers.join('\n'))
                .setFooter(`${dateFormat(msg.createdAt.toString(), 'HHMM "h" ddd, dd mmm yy')}`);
            bot.channels.cache.get(modules.constObj.attendanceID).send(connectedEmbed);
        }

        if (sendError === true) {
            msg.react(bot.emojis.cache.find(emoji => emoji.name === modules.constObj.errorEmoji));
            errorEmbed = new Discord.MessageEmbed()
                .setColor(modules.constObj.error)
                .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
                .setDescription(`${msg.author} ${errorMessage} ${modules.helpObj.errorConnected}`)
                .setFooter('Note: Use the <#channelID> syntax!')
            msg.channel.send(errorEmbed);
        }
    },
};