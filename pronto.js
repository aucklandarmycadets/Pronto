require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const modules = require('./modules');
const dateFormat = require('dateformat');

Object.keys(botCommands).map(key => {
    bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);

    bot.user.setActivity('the radio net | !help', {type: 'LISTENING'});
});

bot.on('guildMemberAdd', member => {
    modules.newMember(Discord, bot, member);
});

bot.on('message', msg => {
    if (msg.author.bot) return;

    if (msg.channel.type === 'news') {
        msg.react('✅');
    };

    const args = msg.content.split(/ +/);
    const command = args.shift().toLowerCase();

    if (msg.guild === null && msg.content !== '!help leave') return;

    console.info(`Message ${command} received.`);

    if (!bot.commands.has(command)) {
        var regExp = /[a-zA-Z]/g;        

        if (command[0] === '!' && regExp.test(command)) {
            bot.commands.get('!help').execute(Discord, bot, bot.commands, msg, args);
        };
        return;
    };

    try {
        bot.commands.get(command).execute(Discord, bot, bot.commands, msg, args);
    } catch (error) {
        console.error(error);
        errorEmbed = new Discord.MessageEmbed()
            .setColor(modules.constObj.error)
            .setAuthor(bot.user.tag, bot.user.avatarURL())
            .setDescription(`**Error executing ${command} :c**`)
            .setFooter(`${dateFormat(msg.createdAt.toString(), 'HHMM "h" ddd, dd mmm yy')}`);
        bot.channels.cache.get(modules.constObj.debugID).send(errorEmbed);
    };
});

bot.on('voiceStateUpdate', (oldState, newState) => {
    modules.channelPair(Discord, bot, oldState, newState); 
});