const dateFormat = require('dateformat');
const modules = require('../modules');

module.exports = {
    name: modules.cmdList.uptimeCmd,
    description: modules.cmdTxt.uptimeDesc,
    execute(Discord, bot, msg, args) {
        if (!msg.author.id === modules.constObj.devID) {
            bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);
            return;
        }

        else {
            uptimeEmbed = new Discord.MessageEmbed()
                .setColor(modules.constObj.success)
                .setFooter(`${modules.formatAge(bot.uptime)} | ${dateFormat(msg.createdAt, modules.constObj.dateOutput)} | Pronto v${modules.constObj.version}`);
            msg.channel.send(uptimeEmbed);
        }
    },
};