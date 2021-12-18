'use strict';

const Discord = require('discord.js');

const { dateTimeGroup } = require('../modules');
const { debugError, errorReact, findGuildConfiguration, successReact } = require('../handlers');

/** */

/**
 *
 * @function handlers.confirmWithReaction
 * @param {Discord.Message} msg Command/reaction message
 * @param {Discord.Message} dm Direct message to attach confirmation emojis to
 * @param {function():void} confirm Callback function to execute on confirmation
 * @param {function():void} cancel Callback function to execute on cancel
 */
module.exports = async (msg, dm, confirm, cancel) => {
	const { bot } = require('../pronto');
	const { colours, emojis } = await findGuildConfiguration(msg.guild);

	await successReact(dm);
	await errorReact(dm);

	const filter = reaction => reaction.emoji.name === emojis.success.name || reaction.emoji.name === emojis.error.name;
	const collector = dm.createReactionCollector(filter, { dispose: true });

	collector.on('collect', async (reaction, user) => {
		if (!user.bot) {
			const confirmEmbed = new Discord.MessageEmbed()
				.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
				.setColor(colours.error)
				.setDescription('**Cancelled.**')
				.setFooter(await dateTimeGroup());

			if (reaction.emoji.name === emojis.success.name) {
				confirmEmbed.setColor(colours.success);
				confirmEmbed.setDescription('**Confirmed.**');

				if (confirm && typeof (confirm) === 'function') confirm();
			}

			else if (cancel && typeof (cancel) === 'function') cancel();

			dm.edit(confirmEmbed);
			collector.stop();
		}
	});

	collector.on('end', async () => {
		const botReactions = dm.reactions.cache.filter(reaction => reaction.users.cache.has(bot.user.id));
		try {
			for (const reaction of botReactions.values()) {
				await reaction.users.remove(bot.user.id);
			}
		}

		catch (error) {
			debugError(msg.guild, error, 'Error removing reactions from message in DMs.');
		}
	});
};