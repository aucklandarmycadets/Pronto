const Discord = require('discord.js');
const dateFormat = require('dateformat');

const { config: { dateOutput }, ids: { logID }, colours } = require('../config');
const { permissionsUpdate, checkBotPermissions, sendMsg } = require('../modules');

module.exports = {
	events: ['guildMemberUpdate'],
	process: [],
	execute(event, oldMember, newMember) {
		const { bot } = require('../pronto');

		const log = bot.channels.cache.get(logID);
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
		logEmbed.setColor(colours.warn);
		logEmbed.setFooter(`ID: ${newMemberUser.id} | ${dateFormat(dateOutput)}`);
		sendMsg(log, logEmbed);
	},
};