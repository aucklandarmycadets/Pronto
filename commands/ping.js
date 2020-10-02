const dateFormat = require('dateformat');
const modules = require('../modules');

module.exports = {
    name: 'ping',
    description: 'Test the latency of the bot.',
    execute(Discord, bot, msg, args) {
        sendError = false;

        if (!msg.author.id === modules.constObj.devID) {
            bot.commands.get('help').execute(Discord, bot, msg, args);
            return;
        }

        else {
            msg.react(bot.emojis.cache.find(emoji => emoji.name === modules.constObj.successEmoji));

            pingEmbed = new Discord.MessageEmbed()
                .setTitle('Pong!')
                .setColor(modules.constObj.success)
                .setDescription(`Latency is ${Date.now() - msg.createdTimestamp}ms. API Latency is ${Math.round(bot.ws.ping)}ms`)
                .setFooter(`${dateFormat(msg.createdAt.toString(), 'HHMM "h" ddd, dd mmm yy')}`);
            msg.channel.send(pingEmbed);
        }
    },
};