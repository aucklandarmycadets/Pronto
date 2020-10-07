'use strict';

require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const pairs = require('./channelPairs');
const dateFormat = require('dateformat');

Object.keys(botCommands).map(key => {
	bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

const modules = require('./modules');
const { cmdList: { helpCmd, purgeCmd } } = modules;
const { helpObj: { errorPurge } } = modules;
const { dmCmds, initialise, debugError, dmCmdError, formatAge, rolesOutput, embedScaffold } = modules;
const { constObj: {
	prefix,
	permsInt,
	dateOutput,
	version,
	success: successGreen,
	error: errorRed,
	yellow,
	logID,
	recruitingID,
	newMembersID,
	visitorID,
	devID,
	serverID,
	successEmoji,
	adjPlus,
} } = modules;

let devDirectChannel;
let logChannel;
let recruitingChannel;
let newMembersChannel;

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
bot.on('roleCreate', role => onRoleUpdate(role, true));
bot.on('roleDelete', role => onRoleUpdate(role));
bot.on('roleUpdate', (oldRole, newRole) => onRoleChange(oldRole, newRole));
bot.on('messageDelete', msg => onMessageDelete(msg));
bot.on('messageDeleteBulk', msgs => onBulkDelete(msgs));
bot.on('messageUpdate', (oldMessage, newMessage) => onMessageUpdate(oldMessage, newMessage));
bot.on('error', info => onDevInfo(info, 'Error'));
bot.on('warn', info => onDevInfo(info, 'Warn'));

function onReady() {
	console.info(`Logged in as ${bot.user.tag}!`);
	initialise(bot);
	devDirectChannel = bot.users.cache.get(devID);
	logChannel = bot.channels.cache.get(logID);
	recruitingChannel = bot.channels.cache.get(recruitingID);
	newMembersChannel = bot.channels.cache.get(newMembersID);

	const botUser = bot.user;

	const readyEmbed = new Discord.MessageEmbed()
		.setColor(successGreen)
		.setAuthor(botUser.tag, botUser.avatarURL())
		.setDescription('**Ready to go!**')
		.setFooter(`${dateFormat(Date.now(), dateOutput)} | Pronto v${version}`);
	devDirectChannel.send(readyEmbed);

	botUser.setActivity(`the radio net | ${prefix}${helpCmd}`, { type: 'LISTENING' });

	exports.bot = bot;

	checkBotPermissions();
}

function onMessage(msg) {
	if (msg.channel.type === 'news') {
		msg.react('✅').catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));
	}

	if (msg.author.bot || !msg.content.startsWith(prefix)) return;

	if (!msg.guild && !dmCmds.includes(msg.content)) {
		dmCmdError(msg);
		return;
	}

	const args = msg.content.split(/ +/);
	const command = args.shift().toLowerCase().replace(prefix, '');

	if (!bot.commands.has(command)) {
		const regExp = /[a-zA-Z]/g;

		if (regExp.test(command)) bot.commands.get(helpCmd).execute(msg, args);

		return;
	}

	try {
		bot.commands.get(command).execute(msg, args);
	}

	catch (error) {
		debugError(error, `Error executing ${command} :c`);
	}
}

function onMemberBan(guild, member, banned) {
	const logEmbed = new Discord.MessageEmbed();

	if (banned) {
		logEmbed.setColor(errorRed);
		logEmbed.setAuthor('Member Banned', member.displayAvatarURL());
	}

	else {
		logEmbed.setColor(successGreen);
		logEmbed.setAuthor('Member Unbanned', member.displayAvatarURL());
	}

	logEmbed.setThumbnail(member.displayAvatarURL());
	logEmbed.setDescription(`${member} ${member.tag}`);
	logEmbed.setFooter(`ID: ${member.id} | ${dateFormat(Date.now(), dateOutput)}`);
	logChannel.send(logEmbed);
}

function onMemberAdd(member) {
	const memberUser = member.user;

	const logEmbed = new Discord.MessageEmbed()
		.setColor(successGreen)
		.setAuthor('Member Joined', memberUser.displayAvatarURL())
		.setThumbnail(memberUser.displayAvatarURL())
		.setDescription(`${memberUser} ${memberUser.tag}`)
		.addField('Account Age', formatAge(Date.now() - memberUser.createdAt))
		.setFooter(`ID: ${memberUser.id} | ${dateFormat(member.joinedAt, dateOutput)}`);
	logChannel.send(logEmbed);

	if (memberUser.bot) return;

	const visitorRole = member.guild.roles.cache.find(role => role.id === visitorID);
	member.roles.add(visitorRole).catch(error => debugError(error, `Error adding ${member} to ${visitorRole}.`));

	const welcomeEmbed = new Discord.MessageEmbed()
		.setColor(yellow)
		.setAuthor(memberUser.tag, memberUser.displayAvatarURL())
		.setDescription(`**${memberUser} has just entered ${newMembersChannel}.**\nMake them feel welcome!`)
		.setFooter(`${dateFormat(member.joinedAt, dateOutput)}`);
	recruitingChannel.send(welcomeEmbed);
}

function onMemberRemove(member) {
	if (member.deleted) return;

	const memberUser = member.user;
	const memberRoles = member.roles.cache.array();

	const logEmbed = new Discord.MessageEmbed()
		.setColor(errorRed)
		.setAuthor('Member Left', memberUser.displayAvatarURL())
		.setThumbnail(memberUser.displayAvatarURL())
		.setDescription(`${memberUser} ${memberUser.tag}`)
		.addField('Roles', rolesOutput(memberRoles, true))
		.setFooter(`ID: ${memberUser.id} | ${dateFormat(Date.now(), dateOutput)}`);
	logChannel.send(logEmbed);
}

function onMemberUpdate(oldMember, newMember) {
	const roleDifference = newMember.roles.cache.difference(oldMember.roles.cache).first();
	const newMemberUser = newMember.user;

	const logEmbed = new Discord.MessageEmbed();

	if (roleDifference) {
		if (newMember.roles.cache.some(role => role.id === roleDifference.id)) {
			logEmbed.setDescription(`**${newMemberUser} was added to** ${roleDifference}`);
		}

		else if (oldMember.roles.cache.some(role => role.id === roleDifference.id)) {
			logEmbed.setDescription(`**${newMemberUser} was removed from** ${roleDifference}`);
		}

		if (newMember.id === bot.user.id) {
			const changedPerms = permissionsUpdate(oldMember, newMember);
			checkBotPermissions(changedPerms);
		}
	}

	else if (newMember.displayName !== oldMember.displayName) {
		logEmbed.setDescription(`**Nickname for ${newMemberUser} changed**`);
		logEmbed.addField('Before', oldMember.displayName);
		logEmbed.addField('After', newMember.displayName);
	}

	else return;

	logEmbed.setAuthor(newMemberUser.tag, newMemberUser.displayAvatarURL());
	logEmbed.setColor(yellow);
	logEmbed.setFooter(`ID: ${newMemberUser.id} | ${dateFormat(Date.now(), dateOutput)}`);
	logChannel.send(logEmbed);
}

function onVoiceUpdate(oldState, newState) {
	const newMember = newState.member;

	const logEmbed = new Discord.MessageEmbed()
		.setAuthor(newMember.displayName, newMember.user.displayAvatarURL());

	let oldID;
	let newID;
	if (oldState.channel) oldID = oldState.channelID;
	if (newState.channel) newID = newState.channelID;

	if (oldID && newID) {
		logEmbed.setColor(yellow);
		logEmbed.setDescription(`**${newMember} changed voice channel ${oldState.channel} > ${newState.channel}**`);
		logEmbed.setFooter(`ID: ${newMember.id} | ${dateFormat(Date.now(), dateOutput)}`);
	}

	else if (!oldID) {
		logEmbed.setColor(successGreen);
		logEmbed.setDescription(`**${newMember} joined voice channel ${newState.channel}**`);
		logEmbed.setFooter(`ID: ${newMember.id} | Channel: ${newID} | ${dateFormat(Date.now(), dateOutput)}`);
	}

	else if (!newID) {
		logEmbed.setColor(errorRed);
		logEmbed.setDescription(`**${newMember} left voice channel ${oldState.channel}**`);
		logEmbed.setFooter(`ID: ${newMember.id} | Channel: ${oldID} | ${dateFormat(Date.now(), dateOutput)}`);
	}

	logChannel.send(logEmbed);

	for (let i = 0; i < pairs.length; i++) {
		const textChannel = newState.guild.channels.cache.get(pairs[i].text);
		if (!textChannel) {
			console.error('Invalid text channel ID in JSON.');
			continue;
		}

		const vcID = pairs[i].voice;

		if (oldID !== vcID && newID === vcID) {
			textChannel.updateOverwrite(newState.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true })
				.then(() => {
					const joinEmbed = new Discord.MessageEmbed()
						.setColor(successGreen)
						.setAuthor(newMember.displayName, newMember.user.displayAvatarURL())
						.setDescription(`${newMember} has joined the channel.`)
						.setFooter(`${dateFormat(Date.now(), dateOutput)}`);
					textChannel.send(joinEmbed);
				})
				.catch(error => {
					debugError(error, `Error giving ${newMember} permissions to ${textChannel}.`);
				});
		}

		else if (oldID === vcID && newID !== vcID) {
			textChannel.permissionOverwrites.get(newState.id).delete()
				.then(() => {
					const leaveEmbed = new Discord.MessageEmbed()
						.setColor(errorRed)
						.setAuthor(newMember.displayName, newMember.user.displayAvatarURL())
						.setDescription(`${newMember} has left the channel.`)
						.setFooter(`${dateFormat(Date.now(), dateOutput)}`);
					textChannel.send(leaveEmbed);

					if (oldState.channel.members.size === 0) {
						const successEmojiObj = newState.guild.emojis.cache.find(emoji => emoji.name === successEmoji);

						const purgeEmbed = new Discord.MessageEmbed()
							.setTitle('Purge Text Channel')
							.setColor(successGreen)
							.setDescription(`Click on the ${successEmojiObj} reaction to purge this channel.`);
						textChannel.send(purgeEmbed).then(msg => {
							msg.react(successEmojiObj)
								.catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

							const filter = (reaction) => {
								return reaction.emoji.name === successEmoji;
							};

							const collector = msg.createReactionCollector(filter, { time: 90000, dispose: true });

							collector.on('collect', (reaction, user) => {
								if (msg.guild.members.cache.get(user.id).roles.cache.some(roles => adjPlus.includes(roles.id))) {
									msg.channel.messages.fetch({ limit: 100 })
										.then((messages) => {
											purgeChannel(messages, msg.channel, collector);
										});
								}

								else if (!user.bot) {
									const errorEmbed = new Discord.MessageEmbed()
										.setColor(errorRed)
										.setAuthor(newMember.displayName, newMember.user.displayAvatarURL())
										.setDescription(`${user} Insufficient permissions. ${errorPurge}`);
									textChannel.send(errorEmbed);
								}
							});

							collector.on('remove', (reaction, user) => {
								if (msg.guild.members.cache.get(user.id).roles.cache.some(roles => adjPlus.includes(roles.id))) {
									msg.channel.messages.fetch({ limit: 100 })
										.then((messages) => {
											purgeChannel(messages, msg.channel, collector);
										});
								}
							});

							collector.on('end', (collected, reason) => {
								if (reason === 'time') {
									msg.reactions.removeAll()
										.catch(error => {
											debugError(error, `Error removing reactions from [message](${msg.url}) in ${textChannel}.`);
										});

									const timeEmbed = new Discord.MessageEmbed()
										.setColor(errorRed)
										.setAuthor(bot.user.tag, bot.user.avatarURL())
										.setDescription(`Timed out. Type \`${prefix}${purgeCmd} 100\` to clear this channel manually.`);
									textChannel.send(timeEmbed);
								}
							});
						});
					}
				})
				.catch(error => {
					debugError(error, `Error removing ${newMember}'s permissions to ${textChannel}.`);
				});
		}
	}
}

function onRoleUpdate(role, created) {
	const logEmbed = new Discord.MessageEmbed()
		.setAuthor(role.guild.name, role.guild.iconURL())
		.setFooter(`ID: ${role.id} | ${dateFormat(role.createdAt, dateOutput)}`);

	if (created) {
		logEmbed.setColor(successGreen);
		logEmbed.setDescription(`**Role Created: ${role.name}**`);
	}

	else {
		logEmbed.setColor(errorRed);
		logEmbed.setDescription(`**Role Deleted: ${role.name}**`);
	}

	logChannel.send(logEmbed);
}

function onRoleChange(oldRole, newRole) {
	const logEmbed = new Discord.MessageEmbed();

	if (oldRole.color !== newRole.color) {
		logEmbed.setColor(newRole.color);
		logEmbed.setDescription(`**Role colour ${newRole} changed**`);
		logEmbed.addField('Before', oldRole.hexColor);
		logEmbed.addField('After', newRole.hexColor);
	}

	else if (oldRole.name !== newRole.name) {
		logEmbed.setColor(yellow);
		logEmbed.setDescription(`**Role name ${newRole} changed**`);
		logEmbed.addField('Before', oldRole.name);
		logEmbed.addField('After', newRole.name);
	}

	else if (oldRole.permissions !== newRole.permissions) {
		logEmbed.setColor(yellow);
		logEmbed.setDescription(`**Role permissions ${newRole} changed**`);

		const oldPerms = oldRole.permissions.toArray();
		const changedPerms = permissionsUpdate(newRole, oldRole);

		const removedPerms = [];
		const addedPerms = [];

		for (let i = 0; i < changedPerms.length; i++) {
			if (oldPerms.includes(changedPerms[i])) removedPerms.push(changedPerms[i]);
			else addedPerms.push(changedPerms[i]);
		}

		if (addedPerms.length > 0) logEmbed.addField('Added Permissions', addedPerms);
		if (removedPerms.length > 0) logEmbed.addField('Removed Permissions', removedPerms);

		const botRoles = newRole.guild.me.roles.cache;

		if (botRoles.some(role => role.id === newRole.id)) checkBotPermissions(changedPerms);
	}

	else return;

	logEmbed.setAuthor(newRole.guild.name, newRole.guild.iconURL());
	logEmbed.setFooter(`ID: ${newRole.id} | ${dateFormat(Date.now(), dateOutput)}`);
	logChannel.send(logEmbed);
}

async function onMessageDelete(msg) {
	if (msg.content.startsWith(prefix) || !msg.guild) return;

	const messageAuthor = msg.author;
	const lastMessage = msg.channel.lastMessage;

	const fetchedLogs = await msg.guild.fetchAuditLogs({
		limit: 1,
		type: 'MESSAGE_DELETE',
	});

	const deletionLog = fetchedLogs.entries.first();

	const logEmbed = new Discord.MessageEmbed()
		.setColor(errorRed)
		.setAuthor(messageAuthor.tag, messageAuthor.displayAvatarURL())
		.setDescription(`**Message sent by ${messageAuthor} deleted in ${msg.channel}**\n${msg.content}`)
		.setFooter(`Author: ${messageAuthor.id} | Message: ${msg.id} | ${dateFormat(Date.now(), dateOutput)}`);

	if (lastMessage && lastMessage.content.includes(purgeCmd)) {
		lastMessage.delete().catch(error => debugError(error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content));
		logEmbed.setDescription(`**Message sent by ${messageAuthor} deleted by ${lastMessage.author} in ${msg.channel}**\n${msg.content}`);
	}

	if (deletionLog) {
		const { executor, target } = deletionLog;

		if (target.id === messageAuthor.id) {
			logEmbed.setDescription(`**Message sent by ${messageAuthor} deleted by ${executor} in ${msg.channel}**\n${msg.content}`);
		}
	}

	logChannel.send(logEmbed);
}

function onBulkDelete(msgs) {
	const msg = msgs.first();
	const deleteCount = msgs.array().length;
	const lastMessage = msg.channel.lastMessage;

	const logEmbed = new Discord.MessageEmbed();

	if (!lastMessage) {
		logEmbed.setAuthor(msg.guild.name, msg.guild.iconURL());
		logEmbed.setDescription(`**${deleteCount} messages bulk deleted in ${msg.channel}**`);
	}

	else if (lastMessage.content.includes(purgeCmd)) {
		lastMessage.delete().catch(error => debugError(error, `Error deleting message in ${msg.channel}.`, 'Message', lastMessage.content));

		logEmbed.setAuthor(msg.author.tag, msg.author.displayAvatarURL());
		logEmbed.setDescription(`**${deleteCount} messages bulk deleted by ${lastMessage.author} in ${msg.channel}**`);
	}

	logEmbed.setColor(errorRed);
	logEmbed.setFooter(`${dateFormat(Date.now(), dateOutput)}`);
	logChannel.send(logEmbed);
}

function onMessageUpdate(oldMessage, newMessage) {
	if (oldMessage.content === newMessage.content || messageAuthor.bot || !newMessage.guild) return;

	const messageAuthor = newMessage.author;

	const logEmbed = new Discord.MessageEmbed()
		.setColor(yellow)
		.setAuthor(messageAuthor.tag, messageAuthor.displayAvatarURL())
		.setDescription(`**Message edited in ${newMessage.channel}** [Jump to Message](${newMessage.url})`)
		.addField('Before', oldMessage.content)
		.addField('After', newMessage.content)
		.setFooter(`Author: ${messageAuthor.id} | Message: ${newMessage.id} | ${dateFormat(newMessage.editedAt, dateOutput)}`);
	logChannel.send(logEmbed);
}

function onDevInfo(info, type) {
	console.log(`${type}: ${info}`);

	if (type === 'Error') {
		const botUser = bot.user;

		const devEmbed = new Discord.MessageEmbed()
			.setColor(errorRed)
			.setAuthor(botUser.tag, botUser.avatarURL())
			.setDescription(`${type}: Check the logs!`)
			.setFooter(`${dateFormat(Date.now(), dateOutput)} | Pronto v${version}`);
		devDirectChannel.send(devEmbed);
	}
}

function purgeChannel(messages, msgChannel, collector) {
	msgChannel.bulkDelete(messages)
		.catch(error => {
			embedScaffold(msgChannel, `Error purging ${msgChannel}.`, errorRed, 'msg');
			debugError(error, `Error purging ${msgChannel}.`);
		});
	collector.stop();
}

function permissionsUpdate(oldState, newState) {
	const oldPerms = oldState.permissions.toArray();
	const newPerms = newState.permissions.toArray();

	const changedPerms = [ ...oldPerms.filter(value => newPerms.indexOf(value) === -1),
		...newPerms.filter(value => oldPerms.indexOf(value) === -1) ];

	return changedPerms;
}

function checkBotPermissions(changes) {
	const requiredPermissions = new Discord.Permissions(permsInt);
	const server = bot.guilds.cache.get(serverID);
	const botPermissions = server.me.permissions;
	const hasRequired = botPermissions.has(requiredPermissions);

	const missingPermissions = [...new Set([...requiredPermissions].filter(value => !botPermissions.has(value)))];

	if (!hasRequired) embedScaffold(null, 'I do not have my minimum permissions!', errorRed, 'debug', 'Missing Permissions', missingPermissions);

	else if (changes) {
		const requiredArray = requiredPermissions.toArray();
		console.log('changes');

		for (let i = 0; i < changes.length; i++) {
			if (requiredArray.includes(changes[i])) {
				embedScaffold(null, 'Permissions resolved.', successGreen, 'debug');
				break;
			}
		}
	}
}