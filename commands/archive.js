'use strict';

const Discord = require('discord.js');
const { cmdError, debugError, dtg, embedScaffold, errorReact, sendMsg, successReact } = require('../modules');

module.exports = async guild => {
	const { archive } = await require('../cmds')(guild);
	const { ids: { logID, archivedID }, colours } = await require('../handlers/database')(guild);

	archive.execute = msg => {
		const { bot } = require('../pronto');

		const channelMentions = msg.mentions.channels;
		const numChannelMentions = channelMentions.size;
		const channel = channelMentions.first();

		try {
			if (numChannelMentions === 0) throw 'You must specify a text channel.';

			else if (channelMentions.some(mention => mention.type !== 'text' && mention.type !== 'news')) throw 'You can only archive text channels.';

			else if (numChannelMentions > 1) throw 'You must archive channels individually.';

			else if (bot.channels.cache.get(channel.id).parentID === archivedID) throw 'Channel is already archived.';
		}

		catch (error) { return cmdError(msg, error, archive.error); }

		const log = bot.channels.cache.get(logID);

		channel.setParent(archivedID, { lockPermissions: true })
			.then(async () => {
				successReact(msg);

				const archiveEmbed = new Discord.MessageEmbed()
					.setTitle('Channel Archived 🔒')
					.setColor(colours.error)
					.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
					.setFooter(await dtg());
				sendMsg(channel, archiveEmbed);

				const logEmbed = new Discord.MessageEmbed()
					.setColor(colours.warn)
					.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
					.setDescription(`**Channel ${channel} archived by ${msg.author}**`)
					.setFooter(`User: ${msg.author.id} | Channel: ${channel.id} | ${await dtg()}`);
				sendMsg(log, logEmbed);
			})
			.catch(error => {
				errorReact(msg);
				embedScaffold(msg.channel, `${msg.author} Error archiving ${channel}.`, colours.error, 'msg');
				debugError(error, `Error archiving ${channel}.`);
			});
	};

	return archive;
};