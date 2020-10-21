const { ids: { serverID }, emojis: { successEmoji } } = require('../config');
const { cmds: { restart } } = require('../cmds');
const { debugError } = require('../modules');

module.exports = restart;
module.exports.execute = msg => {
	const { bot } = require('../pronto');
	const server = bot.guilds.cache.get(serverID);
	const successEmojiObj = server.emojis.cache.find(emoji => emoji.name === successEmoji);

	msg.react(successEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

	process.exit();
};