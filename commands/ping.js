const dateFormat = require('dateformat');
const modules = require('../modules');

module.exports = {
    name: modules.cmdList.pingCmd,
    description: modules.cmdTxt.pingDesc,
    execute(Discord, bot, msg, args) {
        if (!msg.author.id === modules.constObj.devID) {
            bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);
            return;
        }

        else {
            var ping = 'Pinging...';

            msg.channel.send('**Pong!**').then(reply => {
                ping = reply.createdTimestamp - msg.createdTimestamp;
                pingEmbed = new Discord.MessageEmbed()
                    .setColor(modules.constObj.success)
                    .setFooter(`${ping} ms | ${dateFormat(msg.createdAt.toString(), modules.constObj.dateOutput)}`);
                reply.edit(pingEmbed);
            });
        }
    },
};