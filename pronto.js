require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const modules = require('./modules');
const prefix = modules.constObj.prefix;
const dateFormat = require('dateformat');

Object.keys(botCommands).map(key => {
    bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);

    bot.user.setActivity(`the radio net | ${prefix}${modules.cmdList.helpCmd}`, {type: 'LISTENING'});
});

bot.on('guildMemberAdd', member => {
    modules.newMember(Discord, bot, member);
});

bot.on('message', msg => {
    if (msg.channel.type === 'news') msg.react('✅');

    if (msg.author.bot || !msg.content.startsWith(prefix)) return;
    
    if (msg.guild === null && msg.content !== `${prefix}${modules.cmdList.helpCmd} ${modules.cmdList.leaveCmd}`) return;

    const args = msg.content.split(/ +/);
    const command = args.shift().toLowerCase().replace(prefix, '');

    if (!bot.commands.has(command)) {
        var regExp = /[a-zA-Z]/g;

        if (regExp.test(command)) bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);

        return;
    };

    try {
        bot.commands.get(command).execute(Discord, bot, msg, args);
    }

    catch (error) {
        console.error(error);

        errorEmbed = new Discord.MessageEmbed()
            .setColor(modules.constObj.error)
            .setAuthor(bot.user.tag, bot.user.avatarURL())
            .setDescription(`**Error executing ${command} :c**`)
            .setFooter(`${dateFormat(msg.createdAt.toString(), modules.constObj.dateOutput)}`);

        bot.channels.cache.get(modules.constObj.debugID).send(errorEmbed);
    };
});

bot.on('voiceStateUpdate', (oldState, newState) => {
    modules.channelPair(Discord, bot, oldState, newState); 
});