'use strict';

const Discord = require('discord.js');
const { debugError, dtg, errorReact, successReact } = require('../modules');

module.exports = async (msg, dm, success, cancel) => {
	const { bot } = require('../pronto');
	const { colours, emojis } = await require('./database')(msg.guild);

	await successReact(dm);
	await errorReact(dm);

	const filter = reaction => reaction.emoji.name === emojis.success.name || reaction.emoji.name === emojis.error.name;
	const collector = dm.createReactionCollector(filter, { dispose: true });

	collector.on('collect', async (reaction, user) => {
		if (!user.bot) {
			const confirmEmbed = new Discord.MessageEmbed()
				.setAuthor(bot.user.tag, bot.user.avatarURL())
				.setColor(colours.error)
				.setDescription('**Cancelled.**')
				.setFooter(await dtg());

			if (reaction.emoji.name === emojis.success.name) {
				confirmEmbed.setColor(colours.success);
				confirmEmbed.setDescription('**Confirmed.**');

				if (success && typeof (success) === 'function') success();
			}

			else if (cancel && typeof (cancel) === 'function') cancel();

			dm.edit(confirmEmbed);
			collector.stop();
		}
	});

	collector.on('end', async () => {
		const userReactions = dm.reactions.cache.filter(reaction => reaction.users.cache.has(bot.user.id));
		try {
			for (const reaction of userReactions.values()) {
				await reaction.users.remove(bot.user.id);
			}
		}

		catch (error) {
			debugError(error, 'Error removing reactions from message in DMs.');
		}
	});
};