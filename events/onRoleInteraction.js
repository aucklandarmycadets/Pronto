'use strict';

const Discord = require('discord.js');

const { dateTimeGroup } = require('../modules');
const { database, sendMsg } = require('../handlers');

module.exports = {
	bot: ['roleCreate', 'roleDelete'],
	process: [],
	/**
	 * Event handler to log whenever a \<Role> is created/deleted
	 * @param {'roleCreate' | 'roleDelete'} event The event that was emitted
	 * @param {Discord.Role} role The \<Role> that was created/deleted
	 */
	async handler(event, role) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await database(role.guild);

		// Create log embed
		const logEmbed = new Discord.MessageEmbed()
			.setAuthor(role.guild.name, role.guild.iconURL({ dynamic: true }))
			// Set colour and description dynamically, depending on the emitted event
			.setColor((event === 'roleCreate') ? colours.success : colours.error)
			.setDescription(`**Role ${(event === 'roleCreate') ? 'Created' : 'Deleted'}: ${role.name}**`)
			.setFooter(`ID: ${role.id} | ${await dateTimeGroup()}`);

		// Get the guild's log channel and send the log embed
		const logChannel = bot.channels.cache.get(logID);
		sendMsg(logChannel, { embeds: [logEmbed] });
	},
};