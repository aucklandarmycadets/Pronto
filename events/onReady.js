'use strict';

const { ids: { DEFAULT_GUILD, DEVELOPER_ID } } = require('../config');
const { embedScaffold, prefixCommand } = require('../modules');
const { lessonReminders, unsubmittedLessons, verifyBotPermissions } = require('../handlers');

module.exports = {
	bot: ['ready'],
	process: [],
	/**
	 * Event handler to notify the developer and execute the bot's startup routine
	 * when the \<Client> becomes ready to start working
	 */
	async handler() {
		const { bot } = require('../pronto');
		const { commands: { help }, colours } = await require('../handlers/database')();

		// Log the successful log-in to the console
		console.info(`Logged in as ${bot.user.tag}!`);

		// Set the bot's activity status
		bot.user.setActivity(`the radio net | ${await prefixCommand(help)}`, { type: 'LISTENING' });

		// Fetch the developer's <User>
		const developer = await bot.users.fetch(DEVELOPER_ID);

		// If the bot cannot find the config's default guild, send an error message to the developer and cease further execution
		if (!bot.guilds.cache.get(DEFAULT_GUILD)) return embedScaffold(null, developer, '**Error reaching the default server, check the config!**', colours.error, 'DEVELOPER', 'Server ID', DEFAULT_GUILD);
		// Otherwise, send a success message to the developer
		embedScaffold(null, developer, '**Ready to go!**', colours.success, 'DEVELOPER');

		// Iterate through each of the bot's guilds and perform the bot's startup routine
		bot.guilds.cache.each(guild => {
			// Call handlers.verifyBotPermissions() to ensure the bot has the necessary <Discord.Permissions>
			verifyBotPermissions(guild);
			// Call handlers.unsubmittedLessons() to update the embed displaying all current unsubmitted lessons
			unsubmittedLessons(guild);
			// Call handlers.lessonReminders() to schedule weekly lesson reminders on unsubmitted lessons
			lessonReminders(guild);
		});
	},
};