const dateFormat = require('dateformat');
const modules = require('../modules');

module.exports = {
    name: modules.cmdList.pingCmd,
    description: modules.cmdTxt.pingDesc,
    execute(Discord, bot, msg, args) {
        'use strict';

        if (!msg.guild && msg.author.id !== modules.constObj.devID) {
            modules.dmCmdError(Discord, bot, msg, true);
            return;
        }

        if (msg.author.id !== modules.constObj.devID) {
            bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);
            return;
        }

        else {
            let ping = 'Pinging...';

            msg.channel.send('**Pong!**').then(reply => {
                ping = reply.createdTimestamp - msg.createdTimestamp;
                const pingEmbed = new Discord.MessageEmbed()
                    .setColor(modules.constObj.success)
                    .setFooter(`${ping} ms | ${dateFormat(msg.createdAt, modules.constObj.dateOutput)} | Pronto v${modules.constObj.version}`);
                reply.edit(pingEmbed);
            });
        }
    },
};