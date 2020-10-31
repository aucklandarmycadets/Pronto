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
| `!ping`           | Test the latency of the bot                   | dev                                                             |
| `!uptime`         | Time since last restart                       | dev                                                             |
| `!evaluate`       | Evaluate Javascript code                      | dev                                                             |
| `!restart`        | Restart the bot                               | dev                                                             |
| `!help`           | Get help with using Pronto                    | All                                                             |
| `!help (command)` | Get help with a specific command              | All (user must have permissions to use the sub-command however) |
| `!leave`          | Submit a leave request                        | NOT nonCadet                                                    |
| `!leavefor`       | Submit a leave request for another cadet      | tacPlus                                                         |
| `!attendance`     | Submit an attendance register                 | tacPlus                                                         |
| `!connected`      | List the members connected to a voice channel | sgtPlus                                                         |
| `!archive`        | Archive a text channel                        | cqmsPlus                                                        |
| `!purge`          | Delete a number of messages from a channel    | adjPlus                                                         |

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

> There are currently 7 effective command tiers:
> - Visitors (`nonCadet`) that are **EXCLUDED** from commands
> - Regular members who **DON'T** have any of `nonCadet`
> - Next tier who have any of `tacPlus`
> - Next tier who have any of `sgtPlus`
> - Next tier who have any of `cqmsPlus`
> - Next tier who have any of `adjPlus`
> - Highest tier (`devID`) 
>> **NOTE:** This does *not* give the dev permissions to every command, they only have access to the commands as per their roles like everyone else. This just means they have access to dev-only commands like `!ping` :)

> To assign these values in v4.0.5, use the following command in a server channel:
> ```js
> !eval database(msg.guild, {
> 	ids: {
> 		formations: ['<role1>', '<role2>'...],
> 		nonCadet: ['<role1>', '<role2>'...],
> 		tacPlus: ['<role1>', '<role2>'...],
> 		sgtPlus: ['<role1>', '<role2>'...],
> 		cqmsPlus: ['<role1>', '<role2>'...],
> 		adjPlus: ['<role1>', '<role2>'...],
> 	}
> })
> ```
> A dashboard is coming soon!

For the emojis to work (and for the bot to not throw heaps of errors...), [add two emojis to the server](https://support.discord.com/hc/en-us/articles/360041139231-Adding-Emojis-and-Reactions#h_ac364eb7-4f4f-4e0a-b829-1ee247f9a094), one named 'success' and the other 'error' :)

1. Follow [this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to create your own bot user and get your bot token (you can set your own picture and name also!)

> The only location where 'Pronto' is actually named is in `cmds.js`, `config.js` and the dev only `ping.js`, `uptime.js` and `restart.js`:
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

> To change the bot's status message, look in `pronto.js`:
> ```js
> bot.user.setActivity(`the radio net | ${pCmd(help)}`, { type: 'LISTENING' });
> ```
> More information can be found [here](https://discordjs.guide/popular-topics/common-questions.html#how-do-i-set-my-playing-status).

6. Create a file named `.env` in the top-level folder (i.e. in the same folder as `pronto.js`) and enter:
```
TOKEN=<YOURTOKENHERE>
MONGOURI=mongodb://localhost/pronto
```
7. Start the bot with `$ node pronto.js` in the repository's folder
8. Done! The bot should now be online, however now you run into the problem of hosting...
9. Read [this](https://www.writebots.com/discord-bot-hosting/) document for more on hosting :)
