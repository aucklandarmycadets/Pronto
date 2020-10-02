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
            msg.react(bot.emojis.cache.find(emoji => emoji.name === modules.constObj.successEmoji));

            var ping = 'Pinging...';

            pingEmbed = new Discord.MessageEmbed()
                .setColor(modules.constObj.success)
                .setDescription(`**Pong!** \`${ping}\`ms`)
                .setFooter(`${dateFormat(msg.createdAt.toString(), modules.constObj.dateOutput)}`);
            msg.channel.send(pingEmbed).then(reply => {
                ping = reply.createdTimestamp - msg.createdTimestamp;
                pingEmbed.setDescription(`**Pong!** \`${ping}\`ms`);
                reply.edit(pingEmbed);
            });
        }
    },
};