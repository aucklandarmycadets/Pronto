# Pronto

A Discord bot developed for the City of Auckland Cadet Unit.

> Named after the Radio Appointment Title for a Signaller, it is designed specifically for a community group, featuring  attendance tracking and other useful commands!

- [Features](#features)
- [Commands List](#commands-list)
- [Installation](#installation)

## About

### Features

- `!leave` and `!leavefor` commands to submit leave tickets into an attendance channel, and messaging a duplicate to the absentee
- `!attendance` to submit an attendance register for a formation
- Dynamic `!help` command tree, displaying only commands the user has permissions for
- `!connected` command to export a list of members connected to a voice channel
- `!archive` command to archive old or retired channels
- `!purge` command to bulk delete messages
- Applies message reactions on successful/unsuccessful executions of commands
- Automatically applies an acknowledgement reaction to announcement posts
- Notifies a recruitment channel when new members join
- Applies a visitor role to new members
- 'Channel pairing', displaying a text channel to the members connected to the paired voice channel only
- A comprehensive logging feature set, such as tracking message edits and deletions
- Fully-featured error detection and responses, with specific prompts detailing expected input
- Easily forkable, with a consolidated configuration and commands list to adapt to your needs
- Easily modified permissions and aliases for individual commands, including whether command is allowed in direct messages

### Commands List

| Command           | Description                                   | Default Permissions                                             |
| ----------------- | --------------------------------------------- | --------------------------------------------------------------- |
| `!ping`           | Test the latency of the bot                   | Dev                                                             |
| `!uptime`         | Time since last restart                       | Dev                                                             |
| `!evaluate`       | Evaluate Javascript code                      | Dev                                                             |
| `!restart`        | Restart the bot                               | Dev                                                             |
| `!help`           | Get help with using Pronto                    | All                                                             |
| `!help (command)` | Get help with a specific command              | All (user must have permissions to use the sub-command however) |
| `!leave`          | Submit a leave request                        | None                                                            |
| `!leavefor`       | Submit a leave request for another cadet      | None                                                            |
| `!attendance`     | Submit an attendance register                 | None                                                            |
| `!connected`      | List the members connected to a voice channel | None                                                            |
| `!archive`        | Archive a text channel                        | None                                                            |
| `!purge`          | Delete a number of messages from a channel    | None                                                            |

## Installation

### Minimum Requirements

- **Node.js** v12.x
- **npm** 

### Dependencies

- [discord.js](https://www.npmjs.com/package/discord.js)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [dateformat](https://www.npmjs.com/package/dateformat)
- [Mongoose](https://www.npmjs.com/package/mongoose)

### Instructions

1. Clone this repository `$ git clone https://github.com/JamesNZL/Pronto.git`
2. Install required packages by running `$ npm install` in the repository's folder
3. Install [MongoDB Community Edition](https://docs.mongodb.com/manual/administration/install-community/)
4. Open `config.js` and change the IDs:
```js
exports.config = {
	prefix: '!',
	permsInt: 1879141584,
	dateOutput: 'HHMM "h" ddd, d mmm yy',
	prontoLogo: 'https://i.imgur.com/EzmJVyV.png',
};

exports.ids = {
	defaultServer: '765758073942966272',
	devID: '192181901065322496',
};
```
| Field           | Purpose                                                                                                                                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `permsInt`      | You shouldn't change this unless you know what you're doing or adding/removing things from the bot, in which case Pronto may require more/less minimum [Discord permissions](https://discordapi.com/permissions.html).                       |
| `dateOutput`    | This is the formatting string used with dateformat, find their docs [here](https://www.npmjs.com/package/dateformat#mask-options).                                                                                                           |
| `defaultServer` | This is the ID of the default server to look for in the database if a guild is not specified. Refer to [this](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) to find out how to get it |
| `devID`         | ID of the user who is looking after the bot (i.e. probably you)                                                                                                                                                                              |

> To assign command permissions in v4.0.8, use the following command in a server channel:
> ```js
> !eval database(msg.guild, {
>	ids: {
>		formations: ['<role1ID>', '<role2ID>'...],
>	},
>	cmds: {
>		leave: {
>			roles: ['<role1ID>', '<role2ID>'...],
>			noRoles: ['<role1ID>', '<role2ID>'...],
>		},
>		leaveFor: {
>			roles: ['<role1ID>', '<role2ID>'...],
>			noRoles: ['<role1ID>', '<role2ID>'...],
>		},
>		attendance: {
>			roles: ['<role1ID>', '<role2ID>'...],
>			noRoles: ['<role1ID>', '<role2ID>'...],
>		},
>		connected: {
>			roles: ['<role1ID>', '<role2ID>'...],
>			noRoles: ['<role1ID>', '<role2ID>'...],
>		},
>		archive: {
>			roles: ['<role1ID>', '<role2ID>'...],
>			noRoles: ['<role1ID>', '<role2ID>'...],
>		},
>		purge: {
>			roles: ['<role1ID>', '<role2ID>'...],
>			noRoles: ['<role1ID>', '<role2ID>'...],
>		}
>	}
> }) -silent
> ```

> To set up channel linking, use the following:
> ```js
> !eval const func = async () => {
>	const Guild = require('../models/guild');
>
>	const database = await Guild.findOne({ guildID: msg.guild.id }, error => {
>		if (error) console.error(error);
>	});
>
>	database.ids.channelPairs = [
>		{ voice: 'voice1ID', text: 'text1ID' },
>		{ voice: 'voice2ID', text: 'text2ID' },
>		{ voice: 'voice3ID', text: 'text3ID' },
>	  ];
>	database.markModified('ids')
>
>	return await database.save().catch(error => console.error(error));
> }
> func() -silent
> ```

> A dashboard is coming soon!

1. Follow [this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to create your own bot user and get your bot token (you can set your own picture and name also!)

> The only location where 'Pronto' is actually named is in `cmds.js`, `config.js` and the dev only `commands\ping.js`, `commands\uptime.js` and `commands\restart.js`:
> ```js
> help: {
> 	cmd: 'help',
> 	aliases: ['cmd', 'cmds', 'command', 'commands'],
> 	desc: {
>		general: 'Get help with using Pronto.',
> ```
> ```js
> pronto: {
> 	name: 'Pronto',
> },
> ```
> ```js
> .setFooter(`${pingValue} ms | ${dateFormat(msg.createdAt, dateOutput)} | Pronto v${version}`);`
> ```
> You can rename the bot here (in the '' marks), and everything will still work! Basically, just don't change file names :)

> To change the bot's status message, look in `events\onReady.js`:
> ```js
> bot.user.setActivity(`the radio net | ${await pCmd(help)}`, { type: 'LISTENING' });
> ```
> More information can be found [here](https://discordjs.guide/popular-topics/common-questions.html#how-do-i-set-my-playing-status).

7. Create a file named `.env` in the top-level folder (i.e. in the same folder as `pronto.js`) and enter:
```
TOKEN=<YOURTOKENHERE>
MONGOURI=mongodb://localhost/pronto
```
8. Start the bot with `$ node pronto.js` in the repository's folder
9. Done! The bot should now be online, however now you run into the problem of hosting...
10. Read [this](https://www.writebots.com/discord-bot-hosting/) document for more on hosting :)
