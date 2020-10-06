const dateFormat = require('dateformat');
const modules = require('../modules');

module.exports = {
    name: modules.cmdList.restartCmd,
    description: modules.cmdTxt.restartDesc,
    execute(Discord, bot, msg, args) {
        'use strict';

        if (msg.author.id !== modules.constObj.devID) {
            bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);
            return;
        }

        else {
            msg.react(msg.guild.emojis.cache.find(emoji => emoji.name === modules.constObj.successEmoji))
                .catch(error => modules.debugError(Discord, bot, error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

            const restartEmbed = new Discord.MessageEmbed()
                .setAuthor(bot.user.tag, bot.user.avatarURL())
                .setDescription('**Restarting...**')
                .addField('Uptime', modules.formatAge(bot.uptime))
                .setColor(modules.constObj.yellow)
                .setFooter(`${dateFormat(msg.createdAt, modules.constObj.dateOutput)} | Pronto v${modules.constObj.version}`);
            bot.channels.cache.get(modules.constObj.debugID).send(restartEmbed).then(msg => process.exit());
        }
    },
};