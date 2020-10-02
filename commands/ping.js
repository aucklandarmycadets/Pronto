const dateFormat = require('dateformat');
const modules = require('../modules');

module.exports = {
    name: modules.cmdList.pingCmd,
    description: modules.cmdTxt.pingDesc,
    execute(Discord, bot, msg, args) {
        sendError = false;

        if (!msg.author.id === modules.constObj.devID) {
            bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);
            return;
        }

        else {
            msg.react(bot.emojis.cache.find(emoji => emoji.name === modules.constObj.successEmoji));

            pingEmbed = new Discord.MessageEmbed()
                .setTitle('Pong!')
                .setColor(modules.constObj.success)
                .setDescription(`Latency is ${Date.now() - msg.createdTimestamp}ms. API Latency is ${Math.round(bot.ws.ping)}ms`)
                .setFooter(`${dateFormat(msg.createdAt.toString(), modules.constObj.dateOutput)}`);
            msg.channel.send(pingEmbed);
        }
    },
};