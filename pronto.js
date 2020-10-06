'use strict';

require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const modules = require('./modules');
const pairs = require('./channelPairs');
const prefix = modules.constObj.prefix;
const dateFormat = require('dateformat');

Object.keys(botCommands).map(key => {
    bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on('ready', () => onReady());
bot.on('message', msg => onMessage(msg));
bot.on('guildBanAdd', (guild, member) => onMemberBan(guild, member, true));
bot.on('guildBanRemove', (guild, member) => onMemberBan(guild, member));
bot.on('guildMemberAdd', member => onMemberAdd(member));
bot.on('guildMemberRemove', member => onMemberRemove(member));
bot.on('guildMemberUpdate', (oldMember, newMember) => onMemberUpdate(oldMember, newMember));
bot.on('voiceStateUpdate', (oldState, newState) => onVoiceUpdate(oldState, newState));
bot.on('invalidated', () => onDevInfo('null', 'Invalidated'));
bot.on('roleCreate', role => onRoleCreate(role));
bot.on('roleDelete', role => onRoleDelete(role));
bot.on('roleUpdate', (oldRole, newRole) => onRoleUpdate(oldRole, newRole));
bot.on('messageDelete', msg => onMessageDelete(msg));
bot.on('messageDeleteBulk', msgs => onBulkDelete(msgs));
bot.on('messageUpdate', (oldMessage, newMessage) => onMessageUpdate(oldMessage, newMessage));
bot.on('error', info => onDevInfo(info, 'Error'));
bot.on('warn', info => onDevInfo(info, 'Warn'));

function onReady() {
    console.info(`Logged in as ${bot.user.tag}!`);

    const readyEmbed = new Discord.MessageEmbed()
        .setColor(modules.constObj.success)
        .setAuthor(bot.user.tag, bot.user.avatarURL())
        .setDescription(`**Ready to go!**`)
        .setFooter(`${dateFormat(Date.now(), modules.constObj.dateOutput)} | Pronto v${modules.constObj.version}`);
    bot.channels.cache.get(modules.constObj.debugID).send(readyEmbed);

    bot.user.setActivity(`the radio net | ${prefix}${modules.cmdList.helpCmd}`, {type: 'LISTENING'});
}

function onMessage(msg) {
    if (msg.channel.type === 'news') msg.react('✅')
        .catch(error => modules.debugError(Discord, bot, error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

    if (msg.author.bot || !msg.content.startsWith(prefix)) return;

    if (!msg.guild && !modules.dmCmds.includes(msg.content)) {
        modules.dmCmdError(Discord, bot, msg);
        return;
    }

    const args = msg.content.split(/ +/);
    const command = args.shift().toLowerCase().replace(prefix, '');

    if (!bot.commands.has(command)) {
        const regExp = /[a-zA-Z]/g;

        if (regExp.test(command)) bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);

        return;
    }

    try {
        bot.commands.get(command).execute(Discord, bot, msg, args);
    }

    catch (error) {
        modules.debugError(Discord, bot, error, `Error executing ${command} :c`);
    }
}

function onMemberBan(guild, member, banned) {
    const logEmbed = new Discord.MessageEmbed();

    if (banned) {
        logEmbed.setColor(modules.constObj.error);
        logEmbed.setAuthor('Member Banned', member.displayAvatarURL());
    }

    else {
        logEmbed.setColor(modules.constObj.success);
        logEmbed.setAuthor('Member Unbanned', member.displayAvatarURL());
    }

    logEmbed.setThumbnail(member.displayAvatarURL());
    logEmbed.setDescription(`${member} ${member.tag}`);
    logEmbed.setFooter(`ID: ${member.id} | ${dateFormat(Date.now(), modules.constObj.dateOutput)}`);
    guild.channels.cache.get(modules.constObj.logID).send(logEmbed);
}

function onMemberAdd(member) {
    const logEmbed = new Discord.MessageEmbed()
        .setColor(modules.constObj.success)
        .setAuthor('Member Joined', member.user.displayAvatarURL())
        .setThumbnail(member.user.displayAvatarURL())
        .setDescription(`${member.user} ${member.user.tag}`)
        .addField('Account Age', modules.formatAge(Date.now() - member.user.createdAt))
        .setFooter(`ID: ${member.user.id} | ${dateFormat(member.joinedAt, modules.constObj.dateOutput)}`);
    member.guild.channels.cache.get(modules.constObj.logID).send(logEmbed);

    if (member.user.bot) return;

    const visitorRole = member.guild.roles.cache.find(role => role.id === modules.constObj.visitorID);
    member.roles.add(visitorRole).catch(error => modules.debugError(Discord, bot, error, `Error adding ${member} to ${visitorRole}.`));

    const welcomeEmbed = new Discord.MessageEmbed()
        .setColor(modules.constObj.yellow)
        .setAuthor(member.user.tag, member.user.displayAvatarURL())
        .setDescription(`**${member.user} has just entered ${member.guild.channels.cache.get(modules.constObj.newMembersID)}.**\nMake them feel welcome!`)
        .setFooter(`${dateFormat(member.joinedAt, modules.constObj.dateOutput)}`);
    member.guild.channels.cache.get(modules.constObj.recruitingID).send(welcomeEmbed);
}

function onMemberRemove(member) {
    if (member.deleted) return;

    const logEmbed = new Discord.MessageEmbed()
        .setColor(modules.constObj.error)
        .setAuthor('Member Left', member.user.displayAvatarURL())
        .setThumbnail(member.user.displayAvatarURL())
        .setDescription(`${member.user} ${member.user.tag}`)
        .addField('Roles', modules.rolesOutput(member.roles.cache.array(), true))
        .setFooter(`ID: ${member.user.id} | ${dateFormat(Date.now(), modules.constObj.dateOutput)}`);
    member.guild.channels.cache.get(modules.constObj.logID).send(logEmbed);
}

function onMemberUpdate(oldMember, newMember) {
    const roleDifference = newMember.roles.cache.difference(oldMember.roles.cache);
    const logEmbed = new Discord.MessageEmbed();

    if (roleDifference.first()) {
        if (newMember.roles.cache.some(role => role.id === roleDifference.first().id)) {
            logEmbed.setDescription(`**${newMember.user} was added to** ${roleDifference.first()}`);
        }

        else if (oldMember.roles.cache.some(role => role.id === roleDifference.first().id)) {
            logEmbed.setDescription(`**${newMember.user} was removed from** ${roleDifference.first()}`);
        }
    }

    else if (newMember.displayName !== oldMember.displayName) {
        logEmbed.setDescription(`**Nickname for ${newMember.user} changed**`);
        logEmbed.addField('Before', oldMember.displayName);
        logEmbed.addField('After', newMember.displayName);
    }

    else return;

    logEmbed.setAuthor(newMember.user.tag, newMember.user.displayAvatarURL());
    logEmbed.setColor(modules.constObj.yellow);
    logEmbed.setFooter(`ID: ${newMember.user.id} | ${dateFormat(Date.now(), modules.constObj.dateOutput)}`);
    newMember.guild.channels.cache.get(modules.constObj.logID).send(logEmbed);
}

function onVoiceUpdate(oldState, newState) {
    const logEmbed = new Discord.MessageEmbed()
        .setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL());

    let oldID;
    let newID;
    if (oldState.channel) oldID = oldState.channelID;
    if (newState.channel) newID = newState.channelID;

    if (oldID && newID) {
        logEmbed.setColor(modules.constObj.yellow);
        logEmbed.setDescription(`**${newState.member} changed voice channel ${oldState.channel} > ${newState.channel}**`);
        logEmbed.setFooter(`ID: ${newState.member.id} | ${dateFormat(Date.now(), modules.constObj.dateOutput)}`);
    }

    else if (!oldID) {
        logEmbed.setColor(modules.constObj.success);
        logEmbed.setDescription(`**${newState.member} joined voice channel ${newState.channel}**`);
        logEmbed.setFooter(`ID: ${newState.member.id} | Channel: ${newID} | ${dateFormat(Date.now(), modules.constObj.dateOutput)}`);
    }

    else if (!newID) {
        logEmbed.setColor(modules.constObj.error);
        logEmbed.setDescription(`**${newState.member} left voice channel ${oldState.channel}**`);
        logEmbed.setFooter(`ID: ${newState.member.id} | Channel: ${oldID} | ${dateFormat(Date.now(), modules.constObj.dateOutput)}`);
    }

    newState.guild.channels.cache.get(modules.constObj.logID).send(logEmbed);

    for (let i = 0; i < pairs.length; i++) {
        const textChannel = newState.guild.channels.cache.get(pairs[i].text);
        if (!textChannel) {
            console.error('Invalid text channel ID in JSON.');
            continue;
        }

        const vcID = pairs[i].voice;

        if (oldID !== vcID && newID === vcID) {
            textChannel.updateOverwrite(newState.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true })
                .then(newState => {
                    const joinEmbed = new Discord.MessageEmbed()
                        .setColor(modules.constObj.success)
                        .setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL())
                        .setDescription(`${newState.member} has joined the channel.`)
                        .setFooter(`${dateFormat(Date.now(), modules.constObj.dateOutput)}`);
                    textChannel.send(joinEmbed);
                })
                .catch((error, newState) => {
                    modules.debugError(Discord, bot, error, `Error giving ${newState.member} permissions to ${textChannel}.`);
                });
        }

        else if (oldID === vcID && newID !== vcID) {
            textChannel.updateOverwrite(newState.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false })
                .then((newState, oldState) => {
                    const leaveEmbed = new Discord.MessageEmbed()
                        .setColor(modules.constObj.error)
                        .setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL())
                        .setDescription(`${newState.member} has left the channel.`)
                        .setFooter(`${dateFormat(Date.now(), modules.constObj.dateOutput)}`);
                    textChannel.send(leaveEmbed);

                    if (oldState.channel.members.size === 0) {
                        const purgeEmbed = new Discord.MessageEmbed()
                            .setTitle('Purge Text Channel')
                            .setColor(modules.constObj.success)
                            .setDescription(`Click on the ${newState.guild.emojis.cache.find(emoji => emoji.name === modules.constObj.successEmoji)} reaction to purge this channel.`);
                        textChannel.send(purgeEmbed).then(msg => {
                            msg.react(newState.guild.emojis.cache.find(emoji => emoji.name === modules.constObj.successEmoji))
                                .catch(error => modules.debugError(Discord, bot, error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

                            const filter = (reaction, user) => {
                                return reaction.emoji.name === modules.constObj.successEmoji;
                            };

                            const collector = msg.createReactionCollector(filter, { time: 90000, dispose: true });

                            collector.on('collect', (reaction, user) => {
                                if (msg.guild.members.cache.get(user.id).roles.cache.some(roles => modules.constObj.adjPlus.includes(roles.id))) {
                                    msg.channel.messages.fetch({ limit: 100 })
                                        .then((messages) => {
                                            purgeChannel(messages, msg, collector);
                                        });
                                }

                                else if (!user.bot) {
                                    const errorEmbed = new Discord.MessageEmbed()
                                        .setColor(modules.constObj.error)
                                        .setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL())
                                        .setDescription(`${user} Insufficient permissions. ${modules.helpObj.errorPurge}`);
                                    textChannel.send(errorEmbed);
                                }
                            });

                            collector.on('remove', (reaction, user) => {
                                if (msg.guild.members.cache.get(user.id).roles.cache.some(roles => modules.constObj.adjPlus.includes(roles.id))) {
                                    msg.channel.messages.fetch({ limit: 100 })
                                        .then((messages) => {
                                            purgeChannel(messages, msg, collector);
                                        });
                                }
                            });

                            collector.on('end', (collected, reason) => {
                                if (reason === 'time') {
                                    msg.reactions.removeAll()
                                        .catch(error => {
                                            modules.debugError(Discord, bot, error, `Error removing reactions from [message](${msg.url}) in ${textChannel}.`);
                                        });

                                    const timeEmbed = new Discord.MessageEmbed()
                                        .setColor(modules.constObj.error)
                                        .setAuthor(bot.user.tag, bot.user.avatarURL())
                                        .setDescription(`Timed out. Type \`${modules.constObj.prefix}${modules.cmdList.purgeCmd} 100\` to clear this channel manually.`);
                                    textChannel.send(timeEmbed);
                                }
                            });
                        });
                    }
                })
                .catch((error, newState) => {
                    modules.debugError(Discord, bot, error, `Error removing ${newState.member}'s permissions to ${textChannel}.`);
                });
        }
    }
}

function onRoleCreate(role) {
    const logEmbed = new Discord.MessageEmbed()
        .setColor(modules.constObj.success)
        .setAuthor(role.guild.name, role.guild.iconURL())
        .setDescription(`**Role Created: ${role.name}**`)
        .setFooter(`ID: ${role.id} | ${dateFormat(role.createdAt, modules.constObj.dateOutput)}`);
    role.guild.channels.cache.get(modules.constObj.logID).send(logEmbed);
}

function onRoleDelete(role) {
    const logEmbed = new Discord.MessageEmbed()
        .setColor(modules.constObj.error)
        .setAuthor(role.guild.name, role.guild.iconURL())
        .setDescription(`**Role Deleted: ${role.name}**`)
        .setFooter(`ID: ${role.id} | ${dateFormat(Date.now(), modules.constObj.dateOutput)}`);
    role.guild.channels.cache.get(modules.constObj.logID).send(logEmbed);
}

function onRoleUpdate(oldRole, newRole) {
    const logEmbed = new Discord.MessageEmbed();

    if (oldRole.color !== newRole.color) {
        logEmbed.setColor(newRole.color);
        logEmbed.setDescription(`**Role colour ${newRole} changed**`);
        logEmbed.addField('Before', oldRole.hexColor);
        logEmbed.addField('After', newRole.hexColor);
    }

    else if (oldRole.name !== newRole.name) {
        logEmbed.setColor(modules.constObj.yellow);
        logEmbed.setDescription(`**Role name ${newRole} changed**`);
        logEmbed.addField('Before', oldRole.name);
        logEmbed.addField('After', newRole.name);
    }

    else return;

    logEmbed.setAuthor(newRole.guild.name, newRole.guild.iconURL());
    logEmbed.setFooter(`ID: ${newRole.id} | ${dateFormat(Date.now(), modules.constObj.dateOutput)}`);
    newRole.guild.channels.cache.get(modules.constObj.logID).send(logEmbed);
}

function onMessageDelete(msg) {
    if (msg.content.startsWith(prefix)) return;

    const logEmbed = new Discord.MessageEmbed()
        .setColor(modules.constObj.error)
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
        .setDescription(`**Message sent by ${msg.author} deleted in ${msg.channel}**\n${msg.content}`)
        .setFooter(`Author: ${msg.author.id} | Message: ${msg.id} | ${dateFormat(Date.now(), modules.constObj.dateOutput)}`);

    if (msg.channel.lastMessage.content.includes(modules.cmdList.purgeCmd)) {
        msg.channel.lastMessage.delete().catch(error => modules.debugError(Discord, bot, error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content));
        logEmbed.setDescription(`**Message sent by ${msg.author} deleted by ${msg.channel.lastMessage.author} in ${msg.channel}**\n${msg.content}`);
    }

    
    msg.guild.channels.cache.get(modules.constObj.logID).send(logEmbed);
}

function onBulkDelete(msgs) {
    const logEmbed = new Discord.MessageEmbed();

    if (msgs.first().channel.lastMessage.content.includes(modules.cmdList.purgeCmd)) {
        msgs.first().channel.lastMessage.delete().catch(error => modules.debugError(Discord, bot, error, `Error deleting message in ${msgs.first().channel}.`, 'Message', msgs.first().channel.lastMessage.content));
        
        logEmbed.setAuthor(msgs.first().author.tag, msgs.first().author.displayAvatarURL());
        logEmbed.setDescription(`**${msgs.array().length} messages bulk deleted by ${msgs.first().channel.lastMessage.author} in ${msgs.first().channel}**`);
    }

    else {
        logEmbed.setAuthor(msgs.first().guild.name, msgs.first().guild.iconURL());
        logEmbed.setDescription(`**${msgs.array().length} messages bulk deleted in ${msgs.first().channel}**`);
    }

    logEmbed.setColor(modules.constObj.error);
    logEmbed.setFooter(`${dateFormat(Date.now(), modules.constObj.dateOutput)}`);
    msgs.first().guild.channels.cache.get(modules.constObj.logID).send(logEmbed);
}

function onMessageUpdate(oldMessage, newMessage) {
    if (oldMessage.content === newMessage.content || newMessage.author.bot) return;

    const logEmbed = new Discord.MessageEmbed()
        .setColor(modules.constObj.yellow)
        .setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL())
        .setDescription(`**Message edited in ${newMessage.channel}** [Jump to Message](${newMessage.url})`)
        .addField('Before', oldMessage.content)
        .addField('After', newMessage.content)
        .setFooter(`Author: ${newMessage.author.id} | Message: ${newMessage.id} | ${dateFormat(newMessage.editedAt, modules.constObj.dateOutput)}`);
    newMessage.guild.channels.cache.get(modules.constObj.logID).send(logEmbed);
}

function onDevInfo(info, type) {
    console.log(`${type}: ${info}`);

    if (type === 'Error') {
        const devEmbed = new Discord.MessageEmbed()
            .setColor(modules.constObj.error)
            .setAuthor(bot.user.tag, bot.user.avatarURL())
            .setDescription(`${type}: Check the logs!`)
            .setFooter(`${dateFormat(Date.now(), modules.constObj.dateOutput)} | Pronto v${modules.constObj.version}`);
        bot.users.cache.get(modules.constObj.devID).send(devEmbed);
    }
}

function purgeChannel(messages, msg, collector) {
    msg.channel.bulkDelete(messages)
        .catch(error => {
            modules.errorScaffold(Discord, bot, msg, `Error purging ${msg.channel}.`, 'msg');
            modules.debugError(Discord, bot, error, `Error purging ${msg.channel}.`);
        });
    collector.stop();
}