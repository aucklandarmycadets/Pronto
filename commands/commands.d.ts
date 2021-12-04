import Discord = require('discord.js');
import Typings = require('../typings');

/**
 * The \<Client> object for Pronto, with an extended \<Client.commands> property to store the guild's \<Commands>, upserted on each execution of `handlers.commandHandler()`
 */
export interface Client extends Discord.Client {
	commands: ?Discord.Collection<CommandName, Command>;
}

/** The name of the command */
declare type CommandName = string;

/**
 * The description of the command, which differs depending on whether the message command is qualified with a different \<CommandName> as an argument
 */
export interface DynamicCommandDescription {
	/** The description to display in the command's own help text */
	general: string;
	/** The description to display as the command's base description */
	unqualified: string;
	/** The description to display as the command's description if qualified with a different \<CommandName> */
	qualified: string;
}

/**
 * The base of each of Pronto's commands, with the base properties to construct a complete \<Command>
 */
export interface BaseCommand {
	/** The name of the command */
	command: CommandName;
	/** The aliases for the command */
	aliases: string[];
	/** The description of the command */
	description: string | DynamicCommandDescription;
	/** Whether to allow the command to execute from a direct message */
	allowDirect: boolean;
	/** A <Role.id[]> of which the \<GuildMember> must have at least one to execute the command */
	requiredRoles: Discord.Snowflake[];
	/** A <Role.id[]> of which the \<GuildMember> must have none to execute the command */
	deniedRoles: Discord.Snowflake[];
	/** Whether the command is only executable by the developer defined by config.ids.DEVELOPER_ID */
	developerOnly: boolean;
	/** Whether to display the command in the guild's commands list */
	displayInList: boolean;
	/** The help text to display for the command */
	help: string;
	/** The error text to display for the command */
	error: ?string;
}

/**
 * The base of Pronto's commands object, where each \<BaseCommand> is stored in the \<BaseCommands> object under the property [CommandName]
 */
export interface BaseCommands {
	/** The command's individual \<BaseCommand> object */
	[key: CommandName]: BaseCommand;
}

/**
 * The complete \<Command> object for one of Pronto's commands, with a \<Command.execute()> method
 */
export interface Command extends BaseCommand {
	/** The command's \<Command.execute()> method */
	execute(parameters: CommandParameters): Promise<void | Typings.Lesson>;
}

/**
 * The complete \<Commands> object for all of Pronto's commands, where each \<Command> is stored in the \<Commands> object under the property [CommandName]
 */
export interface Commands {
	/** The command's individual \<Command> object */
	[key: CommandName]: Command
}

/**
 * An \<Object> of the valid parameters accepted by the \<Command.execute()> method
 */
export interface CommandParameters {
	/** The \<Message> that executed the \<Command>, or the \<Message> that the reaction collector was attached to */
	msg: Discord.Message;
	/** The \<string[]> containing the command arguments */
	args: ?string[];
	/** The message argument that was parsed to this \<BaseCommand>, i.e. either \<BaseCommand.command> or \<BaseCommand.aliases.includes(msgCommand)> */
	msgCommand: ?string;
	/** The \<User> that triggered the reaction collector */
	user: ?Discord.User;
}