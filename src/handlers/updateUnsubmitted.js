'use strict';

const { unsubmittedLessons } = require('../handlers');

/** */

/**
 *
 * @function handlers.updateUnsubmitted
 * @param {Discord.MessageReaction} reaction The reaction object
 * @param {Discord.User} user The \<User> that applied the guild or reaction emoji
 */
module.exports = async (reaction, user) => {
	const { bot } = require('../pronto');

	const isRefereshEmoji = reaction.emoji.name === '🔄';
	const isBotMessage = reaction.message.author.id === bot.user.id;
	const isUnsubmittedEmbed = (reaction.message.embeds[0])
		? (reaction.message.embeds[0].title)
			? (reaction.message.embeds[0].title === 'Lessons To Be Submitted')
			: false
		: false;

	if (isRefereshEmoji && isBotMessage && isUnsubmittedEmbed) {
		reaction.users.remove(user.id);
		unsubmittedLessons(reaction.message.guild);
	}
};