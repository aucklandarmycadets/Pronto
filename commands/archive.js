const dateFormat = require('dateformat');
const modules = require('../modules');

module.exports = {
    name: '!archive',
    description: 'Archive a text channel.',
    execute(Discord, bot, botcmds, msg, args) {
        sendError = false;

        if (!msg.member.roles.cache.some(roles=>modules.constObj.cqmsPlus.includes(roles.id))) {
            bot.commands.get('!help').execute(Discord, bot, botcmds, msg, args);
            return;
        }

        if (msg.mentions.channels.size === 0) {
            errorMessage = 'You must specify a channel.';
            sendError = true;
        }

        else if (msg.mentions.channels.some(mention => mention.type !== 'text')) {
            errorMessage = ' You can only archive text channels.';
            sendError = true;
        }

        else if (msg.mentions.channels.size > 1) {
            errorMessage = 'You must archive channels individually.';
            sendError = true;
        }

        else if (bot.channels.cache.get(msg.mentions.channels.first().id).parentID === modules.constObj.archivedID) {
            errorMessage = 'Channel is already archived.';
            sendError = true;
        }

        else {
            msg.react(bot.emojis.cache.find(emoji => emoji.name === modules.constObj.successEmoji));

            archiveEmbed = new Discord.MessageEmbed()
                .setTitle('Channel Archived 🔒')
                .setColor(modules.constObj.error)
                .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
                .setFooter(`${dateFormat(msg.createdAt.toString(), 'HHMM "h" ddd, dd mmm yy')}`);
            bot.channels.cache.get(msg.mentions.channels.first().id).send(archiveEmbed);

            msg.mentions.channels.first().setParent(modules.constObj.archivedID, { lockPermissions: true })
                .catch(console.error);
        }

        if (sendError === true) {
            msg.react(bot.emojis.cache.find(emoji => emoji.name === modules.constObj.errorEmoji));
            errorEmbed = new Discord.MessageEmbed()
                .setColor(modules.constObj.error)
                .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
                .setDescription(`${msg.author} ${errorMessage} ${modules.helpObj.errorArchive}`);
            msg.channel.send(errorEmbed);
        }
    },
};