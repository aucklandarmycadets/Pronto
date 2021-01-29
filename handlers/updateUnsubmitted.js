'use strict';

module.exports = async (reaction, user) => {
	const { bot } = require('../pronto');
	const { unsubmittedLessons } = require('./');

	const isRefereshEmoji = reaction.emoji.name === '🔄';
	const isBotMessage = reaction.message.author.id === bot.user.id;
	const isUnsubmittedEmbed = (reaction.message.embeds[0])
		? (reaction.message.embeds[0].title)
			? (reaction.message.embeds[0].title === 'Lessons To Be Submitted')
				? true
				: false
			: false
		: false;

	if (isRefereshEmoji && isBotMessage && isUnsubmittedEmbed) {
		reaction.users.remove(user.id);
		unsubmittedLessons(reaction.message.guild);
	}
};