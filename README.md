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

| Command           | Description                                     | Default Permissions                                             |
|-------------------|-------------------------------------------------|-----------------------------------------------------------------|
| `!ping`           | Test the latency of the bot                     | dev                                                             |
| `!uptime`         | Time since last restart                         | dev                                                             |
| `!evaluate`       | Evaluate Javascript code                        | dev                                                             |
| `!restart`        | Restart the bot                                 | dev                                                             |
| `!help`           | Get help with using Pronto                      | All                                                             |
| `!help (command)` | Get help with a specific command                | All (user must have permissions to use the sub-command however) |
| `!leave`          | Submit a leave request                          | NOT nonCadet                                                    |
| `!leavefor`       | Submit a leave request for another cadet        | tacPlus                                                         |
| `!attendance`     | Submit an attendance register                   | tacPlus                                                         |
| `!connected`      | List the members connected to a voice channel   | sgtPlus                                                         |
| `!archive`        | Archive a text channel                          | cqmsPlus                                                        |
| `!purge`          | Delete a number of messages from a channel      | adjPlus                                                         |

## Installation

### Minimum Requirements

- **Node.js** v12.x
- **npm** 

### Dependencies

- [discord.js](https://www.npmjs.com/package/discord.js)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [dateformat](https://www.npmjs.com/package/dateformat)

### Instructions

1. Clone this repository `$ git clone https://github.com/JamesNZL/Pronto.git`
2. Install required packages by running `$ npm install` in the repository's folder
3. Open `config.js` and change the IDs:
```js
exports.config = {
	prefix: '!',
	permsInt: 1879141584,
	dateOutput: 'HHMM "h" ddd, dd mmm yy',
	prontoLogo: 'https://i.imgur.com/EzmJVyV.png',
};

exports.ids = {
	serverID: '748336465465049230',
	devID: '192181901065322496',
	debugID: '758217147187986432',
	logID: '755289400954454047',
	attendanceID: '748360212754464779',
	recruitingID: '748516417137278985',
	newMembersID: '749150106669940748',
	archivedID: '760421058687139860',
	tacticalID: '748342934880911371',
	classroomID: '748677930778886144',
	visitorID: '748411879923253259',
	administratorID: '748346409853517896',
	formations: ['761143813632294963', '748341753249136672', '748341787336376370', '748342048788316181'],
	nonCadet: ['748411879923253259', '748343310124580894'],
	tacPlus: ['748340800093552731', '748337961321496637', '748338027402756142', '748337933194625104', '748346409853517896'],
	sgtPlus: ['748340611521839115', '748340221719871558', '748340045689389176', '750959240578859018', '748339616112836619', '748338095446949908', '748337933194625104', '748346409853517896'],
	cqmsPlus: ['748340045689389176', '748339616112836619', '748338095446949908', '748337933194625104', '748346409853517896'],
	adjPlus: ['748338095446949908', '748337933194625104', '748346409853517896'],
};

exports.emojis = {
	success: 'success',
	error: 'error',
};

exports.colours = {
	default: 0x1b1b1b,
	pronto: 0xffd456,
	leave: 0xd31145,
	success: 0x45bb8a,
	warn: 0xffcc4d,
	error: 0xef4949,
};
```
| Field             | Purpose                                                                                                                                                                                                                                                                                                                 |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `permsInt`        | You shouldn't change this unless you know what you're doing or adding/removing things from the bot, in which case Pronto may require more/less minimum [Discord permissions](https://discordapi.com/permissions.html).                                                                                                  |
| `dateOutput`      | This is the formatting string used with dateformat, find their docs [here](https://www.npmjs.com/package/dateformat#mask-options).                                                                                                                                                                                      |
| `serverID`        | This is the ID of the server as a whole, refer to [this](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) to find out how to get it                                                                                                                                 |
| `devID`           | ID of the user who is looking after the bot (i.e. probably you)                                                                                                                                                                                                                                                         |
| `debugID`         | ID of the debug channel where Pronto will send error messages                                                                                                                                                                                                                                                           |
| `logID`           | ID of the log channel where Pronto will send logging events (i.e. message   delete, new member, etc.)                                                                                                                                                                                                                   |
| `attendanceID`    | ID of the attendance channel for leave tickets (`!leave`, `!leavefor`, `!attendance`, `!connected` etc.)                                                                                                                                                                                                                |
| `recruitingID`    | ID of the channel where notifications of new members will be sent (separate from the logging channel where only administrators can see it, this is for the users that are responsible for recruiting)                                                                                                                   |
| `newMembersID`    | ID of the channel where visitors have access to                                                                                                                                                                                                                                                                         |
| `tacticalID`      | Can be any text channel, is purely used in the help description for `!archive`                                                                                                                                                                                                                                          |
| `classroomID`     | Can be any voice channel, is purely used in the help description for `!connected`                                                                                                                                                                                                                                       |
| `visitorID`       | ID of the visitor role, given to members when they join the server (you may wish to make it such that members with this role can only view visitor-specific channels)                                                                                                                                                   |
| `administratorID` | ID of the Administrator role, this is included only so that it is not exported in the 'Allowed Roles' section of help messages, if you would like it to display in the list then leave this blank                                                                                                                       |
| `formations`      | Role IDs of the formations which will be automatically applied when `!attendance` is used by a member with one of these roles (i.e. say this contains the IDs for 'Team 1' and 'Team 2', if Team 2's captain uses `!attendance` the resultant message will be titled with 'Team 2' and will be set to Team 2's colour)  |
| `nonCadet`        | Role IDs of all members who are not proper members (i.e. visitors and parents), and allows for commands where everyone who **doesn't** have this role has access                                                                                                                                                        |
| `tacPlus`         | Role IDs of the next tier                                                                                                                                                                                                                                                                                               |
| `sgtPlus`         | Role IDs of the next tier                                                                                                                                                                                                                                                                                               |
| `cqmsPlus`        | Role IDs of the next tier                                                                                                                                                                                                                                                                                               |
| `adjPlus`         | Role IDs of the next tier                                                                                                                                                                                                                                                                                               |
| `cqmsPlus`        | Role IDs of the next tier                                                                                                                                                                                                                                                                                               |
| `adjPlus`         | Role IDs of the next tier                                                                                                                                                                                                                                                                                               |

> This results in 7 effective command tiers:
> - Visitors (`nonCadet`) that are **EXCLUDED** from commands
> - Regular members who **DON'T** have any of `nonCadet`
> - Next tier who have any of `tacPlus`
> - Next tier who have any of `sgtPlus`
> - Next tier who have any of `cqmsPlus`
> - Next tier who have any of `adjPlus`
> - Highest tier (`devID`) 
>> **NOTE:** This does *not* give the dev permissions to every command, they only have access to the commands as per their roles like everyone else. This just means they have access to dev-only commands like `!ping` :)

For the emojis to work (and for the bot to not throw heaps of errors...), [add two emojis to the server](https://support.discord.com/hc/en-us/articles/360041139231-Adding-Emojis-and-Reactions#h_ac364eb7-4f4f-4e0a-b829-1ee247f9a094), one named 'success' and the other 'error' :)

4. Follow [this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to create your own bot user and get your bot token (you can set your own picture and name also!)

> The only location where 'Pronto' is actually named is in `cmds.js` and the dev only `ping.js`, `uptime.js` and `restart.js`:
> ```js
> help: {
> 	cmd: 'help',
> 	aliases: ['cmd', 'cmds', 'command', 'commands'],
> 	desc: {
>		general: 'Get help with using Pronto.',
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

5. Create a file named `.env` in the top-level folder (i.e. in the same folder as `pronto.js`) and enter:
```
TOKEN=<YOURTOKENHERE>
```
6. Start the bot with `$ node pronto.js` in the repository's folder
7. Done! The bot should now be online, however now you run into the problem of hosting...
8. Read [this](https://www.writebots.com/discord-bot-hosting/) document for more on hosting :)
