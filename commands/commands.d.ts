import Discord = require('discord.js');

/**
 * An \<Object> of the valid parameters accepted by the \<Command.execute()> method
 */
export interface CommandParameters {
	/** The \<Message> that executed the command, or the \<Message> that the reaction collector was attached to */
	msg: Discord.Message;
	/** The \<string[]> containing the command arguments */
	args: ?string[];
	/** The message argument that was parsed to this \<CommandBase>, i.e. either \<CommandBase.command> or \<CommandBase.aliases.includes(msgCommand)> */
	msgCommand: ?string;
	/** The \<User> that triggered the reaction collector */
	user: ?Discord.User;
}