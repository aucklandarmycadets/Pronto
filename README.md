# Pronto v4.2.2

A Discord bot developed for the City of Auckland Cadet Unit, built with [discord.js](https://www.npmjs.com/package/discord.js) v12.

> Named after the Radio Appointment Title of a Signaller, Pronto is specifically designed for community groups, featuring attendance tracking and many other useful commands!

## Table of Contents
- [Table of Contents](#table-of-contents)
- [About](#about)
	- [Features](#features)
	- [Commands List](#commands-list)
	- [JSDoc Documentation](#jsdoc-documentation)
- [Installation](#installation)
	- [Requirements](#requirements)
	- [Dependencies](#dependencies)
	- [Instructions](#instructions)

## About

### Features

- `!leave` and `!leavefor` commands to submit leave tickets into an attendance channel, and messaging a duplicate to the absentee
- `!attendance` to submit an attendance register for a formation
- Dynamic `!help` command tree, displaying only commands the user has permissions for
- `!connected` command to export a list of members connected to a voice channel
- `!archive` command to archive old or retired channels
- `!purge` command to bulk delete messages
- Individual configuration database for each separate guild, allowing guild-specific permissions and settings to be applied
- A comprehensive suite of lesson management commands, enabling assignment of lesson warnings to specified instructors, and the creation of a private lesson channel for the instructor to develop a lesson plan
- Applies message reactions on successful/unsuccessful executions of commands
- Automatically applies an acknowledgement reaction to announcement posts
- Notifies a recruitment channel when new members join
- Applies a visitor role to new members
- 'Channel pairing', displaying a hidden text channel to the members connected to the paired voice channel only
- A comprehensive logging feature set, such as tracking message edits and deletions
- Fully-featured error detection and responses, with specific prompts detailing expected input
- Easily forkable, with a consolidated configuration and commands list to adapt to your needs, alongside a broad collection of useful modules and handlers
- Easily modified permissions and aliases for individual commands, including whether the command is allowed in direct messages

### Commands List

| Command           | Description                                                  | Default Permissions                                             |
| ----------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| `!ping`           | Test the latency of the bot                                  | Developer                                                       |
| `!uptime`         | Time since last restart                                      | Developer                                                       |
| `!evaluate`       | Evaluate Javascript code                                     | Developer                                                       |
| `!restart`        | Restart the bot                                              | Developer                                                       |
| `!help`           | Get help with using Pronto                                   | All                                                             |
| `!help (command)` | Get help with a specific command                             | All (user must have permissions to use the sub-command however) |
| `!leave`          | Submit a leave request                                       | None                                                            |
| `!leavefor`       | Submit a leave request for another cadet                     | None                                                            |
| `!attendance`     | Submit an attendance register                                | None                                                            |
| `!connected`      | List the members connected to a voice channel                | None                                                            |
| `!archive`        | Archive a text channel                                       | None                                                            |
| `!purge`          | Delete a number of messages from a channel                   | None                                                            |
| `!lesson view`    | Preview details and attached resources of an assigned lesson | Lesson Instructor                                               |
| `!lesson add`     | Add a resource to a lesson                                   | Lesson Instructor                                               |
| `!lesson remove`  | Remove a resource from a lesson                              | Lesson Instructor                                               |
| `!lesson submit`  | Submit a lesson for approval                                 | Lesson Instructor                                               |
| `!seen`           | Acknowledge receipt of a lesson warning                      | Lesson Instructor                                               |
| `!assign`         | Assign a lesson to an instructor                             | None                                                            |
| `!approve`        | Approve a lesson plan                                        | None                                                            |

### JSDoc Documentation

[GitHub Pages](https://jamesnzl.github.io/Pronto/)

## Installation

### Requirements

- **Node.js** v12.x
- **npm**

### Dependencies

- [discord.js](https://www.npmjs.com/package/discord.js)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [dateformat](https://www.npmjs.com/package/dateformat)
- [mongoose](https://www.npmjs.com/package/mongoose)
- [chrono-node](https://www.npmjs.com/package/chrono-node)
- [node-cron](https://www.npmjs.com/package/node-cron)

### Instructions

1. Clone this repository `$ git clone https://github.com/JamesNZL/Pronto.git`

2. Install required packages by running `$ npm install` in the repository's folder

3. Install [MongoDB Community Edition](https://docs.mongodb.com/manual/administration/install-community/)
	> NOTE: These instructions apply to the set-up of a local database.
	> This guide will not cover how to connect to a MongoDB Atlas database, however this only requires a substitution of `'mongodb://localhost/pronto'` with the Atlas connection string within the value of `MONGOURI=` in `.env`.

4. Open `config.js` and change the configuration settings & default identifiers:
	```js
	exports.settings = {
		prefix: '!',
		PERMISSIONS_INTEGER: 1879141584,
		longDate: 'HHMM "h" ddd, d mmm yy',
		shortDate: 'd mmm',
		prontoLogo: 'https://i.imgur.com/Whgm87R.png',
		lessonCron: '0 16 * * 3',
	};

	exports.ids = {
		DEFAULT_GUILD: '765758073942966272',
		DEVELOPER_ID: '192181901065322496',
	};

	...
	```

    | Property              | Description                                                                                                                                                                                                                                                                                                                 |
    | :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `prefix`              | The command prefix for message commands                                                                                                                                                                                                                                                                                     |
    | `PERMISSIONS_INTEGER` | You shouldn't change this unless you know what you're doing or adding/removing things from the bot.<br>If you are, Pronto may require more/less minimum [Discord permissions](https://discordapi.com/permissions.html).<br>This integer allows Pronto to verify that it has the necessary permissions to function properly. |
    | `longDate`            | The dateformat mask / format string.<br>[Documentation](https://www.npmjs.com/package/dateformat#mask-options)                                                                                                                                                                                                              |
    | `shortDate`           | The dateformat mask that Pronto uses for a 'shortened' date string                                                                                                                                                                                                                                                          |
    | `prontoLogo`          | A link to the image to use as Pronto's logo (e.g. in the thumbnail of the Commands List embed)<br>*NOTE: This is not the avatar of the bot – you need to set that when you create the bot user*                                                                                                                             |
    | `lessonCron`          | The cron schedule expression that controls when Pronto sends out lesson reminders.<br>[Documentation](https://www.npmjs.com/package/node-cron#cron-syntax)                                                                                                                                                                  |
    | `DEFAULT_GUILD`       | The identifier of Pronto's 'master' guild, used as a fallback when a secondary guild has a database error.<br>[How to find a Discord identifier](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)                                                                       |
    | `DEVELOPER_ID`        | The identifier of the user managing the bot (i.e. you)                                                                                                                                                                                                                                                                      |

	> To assign command permissions in v4.2.2, use the following command in a guild channel:
	> ```js
	> !eval database(msg.guild, {
	>	ids: {
	>		formations: ['<roleOneID>', '<roleTwoID>'...],
	>	},
	>	commands: {
	>		leave: {
	>			requiredRoles: ['<roleOneID>', '<roleTwoID>'...],
	>			deniedRoles: ['<roleOneID>', '<roleTwoID>'...],
	>		},
	>		leaveFor: {
	>			requiredRoles: ['<roleOneID>', '<roleTwoID>'...],
	>			deniedRoles: ['<roleOneID>', '<roleTwoID>'...],
	>		},
	>		attendance: {
	>			requiredRoles: ['<roleOneID>', '<roleTwoID>'...],
	>			deniedRoles: ['<roleOneID>', '<roleTwoID>'...],
	>		},
	>		connected: {
	>			requiredRoles: ['<roleOneID>', '<roleTwoID>'...],
	>			deniedRoles: ['<roleOneID>', '<roleTwoID>'...],
	>		},
	>		archive: {
	>			requiredRoles: ['<roleOneID>', '<roleTwoID>'...],
	>			deniedRoles: ['<roleOneID>', '<roleTwoID>'...],
	>		},
	>		purge: {
	>			requiredRoles: ['<roleOneID>', '<roleTwoID>'...],
	>			deniedRoles: ['<roleOneID>', '<roleTwoID>'...],
	>		}
	>	}
	> }) --silent
	> ```

	> To set up channel linking, use the following:
	> ```js
	> !eval (async () => {
	>	const Guild = require('../models/guild');
	>
	>	const database = await Guild.findOne({ guildID: msg.guild.id }, error => {
	>		if (error) console.error(error);
	>	});
	>
	>	database.ids.channelPairs = [
	>		{ voice: 'voiceOneID', text: 'textOneID' },
	>		{ voice: 'voiceTwoID', text: 'textTwoID' },
	>		{ voice: 'voiceThreeID', text: 'textThreeID' },
	>	  ];
	>	database.markModified('ids')
	>
	>	return await database.save().catch(error => console.error(error));
	> })() --silent
	> ```

	> A dashboard is coming soon!

5. Follow [this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to create your own bot user and get your bot token (you can set your own picture and name also!)
	> The only locations where 'Pronto' is actually named by the bot are `commands.js` and `config.js`, and the developer-only `commands\ping.js`, `commands\uptime.js` and `events\exit.js`:
	> ```js
	> help: {
	> 	command: 'help',
	> 	aliases: ['cmd', 'cmds', 'command', 'commands'],
	> 	description: {
	>		general: 'Get help with using Pronto.',
	> 		...
	> ```
	> ```js
	> pronto: {
	> 	name: 'Pronto',
	> },
	> ```
	> ```js
	> .setFooter(`${pingValue} ms | ${await dateTimeGroup()} | Pronto v${version}`);`
	> ```
	> You can rename the bot here (inside the ' ' marks), and everything will still work! Basically, just don't change file names :)

	> To change the bot's status message, look in `events\onReady.js`:
	> ```js
	> bot.user.setActivity(`the radio net | ${await prefixCommand(help)}`, { type: 'LISTENING' });
	> ```
	> Documentation can be found [here](https://discordjs.guide/popular-topics/faq.html#how-do-i-set-my-playing-status).

6. Create a file named `.env` in the top-level folder (i.e. in the same folder as `pronto.js`) and enter:
	```text
	TOKEN=<PASTE_YOUR_BOT_TOKEN_HERE>
	MONGOURI=mongodb://localhost/pronto
	```

7. Start the bot with `$ node pronto.js` in the repository's folder

8. Done! The bot should now be online, however now you run into the problem of hosting...
	> Read [this](https://www.writebots.com/discord-bot-hosting/) document for more on hosting :)
