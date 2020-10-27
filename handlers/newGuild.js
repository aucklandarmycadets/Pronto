const Discord = require('discord.js');
const mongoose = require('mongoose');
const Guild = require('../models/guild');

const { config, names, emojis, colours } = require('../config');
const { dtg, sendMsg } = require('../modules');

module.exports = async guild => {
	guild = new Guild({
		_id: mongoose.Types.ObjectId(),
		guildID: guild.id,
		guildName: guild.name,
		prefix: config.prefix,
		dateOutput: config.dateOutput,
		prontoLogo: config.prontoLogo,
		debugID: await findChannel(names.debug, guild),
		logID: await findChannel(names.log, guild),
		attendanceID: await findChannel(names.attendance, guild),
		recruitingID: await findChannel(names.recruiting, guild),
		newMembersID: await findChannel(names.newMembers, guild),
		archivedID: await findChannel(names.archived, guild, 'category'),
		exampleTextID: await findChannel(names.exampleText, guild),
		exampleVoiceID: await findChannel(names.exampleVoice, guild, 'voice'),
		everyoneID: guild.roles.everyone.id,
		visitorID: findRole(names.visitor, guild),
		administratorID: findRole(names.administrator, guild),
		formations: [],
		nonCadet: [],
		tacPlus: [],
		sgtPlus: [],
		cqmsPlus: [],
		adjPlus: [],
		emojiSuccess: emojis.success,
		emojiError: emojis.error,
		colourDefault: colours.default,
		colourPronto: colours.pronto,
		colourLeave: colours.leave,
		colourSuccess: colours.success,
		colourWarn: colours.warn,
		colourError: colours.error,
	});

	guild.save().catch(error => console.error(error));
};

async function findChannel(channel, guild, type) {
	const { bot } = require('../pronto');

	const channels = guild.channels;
	const everyone = guild.roles.everyone;
	const minPerms = ['VIEW_CHANNEL', 'SEND_MESSAGES'];
	const reqMinPerms = [names.debug];

	const foundChannel = channels.cache.find(chnl => chnl.name === channel);

	try {
		if (foundChannel && !reqMinPerms.includes(channel)) return foundChannel.id;
		else if (foundChannel.permissionsFor(bot.user).has(minPerms)) return foundChannel.id;
	}

	catch { null; }

	let prontoCategory = channels.cache.find(chnl => chnl.type === 'category' && chnl.name === 'Pronto');

	if (!prontoCategory) {
		await channels.create('Pronto', { type: 'category' })
			.then(async chnl => {
				await chnl.setPosition(0);
				await chnl.createOverwrite(bot.user.id, { 'VIEW_CHANNEL': true });
				await chnl.createOverwrite(everyone, { 'VIEW_CHANNEL': false });
				prontoCategory = chnl;
			})
			.catch(error => console.error(`Error creating category 'Pronto' in ${guild.name} \n${error}`));
	}

	const chnlOptions = (type === 'category')
		? { type: type }
		: { parent: prontoCategory, type: type };

	const newChannel = await channels.create(channel, chnlOptions)
		.catch(error => console.error(`Error creating ${channel} in ${guild.name} \n${error}`));

	try {
		const debugChannel = (newChannel.name === names.debug)
			? newChannel
			: bot.channels.cache.find(chnl => chnl.name === names.debug && chnl.guild.id === guild.id);

		if (foundChannel) {
			const createdEmbed = new Discord.MessageEmbed()
				.setColor(colours.error)
				.setDescription(`\n\nI created this channel because I cannot access ${foundChannel}!`);

			sendMsg(debugChannel, createdEmbed);
		}

		await debugChannel.messages.fetch()
			.then(msgs => {
				const filterBy = msg => {
					try { return msg.embeds[0].description.includes('Initialised channel(s)'); }
					catch { null; }
				};

				msgs = msgs.filter(filterBy).size;

				if (!msgs) {
					const embed = new Discord.MessageEmbed()
						.setAuthor(bot.user.tag, bot.user.avatarURL())
						.setColor(colours.pronto)
						.setDescription(`Initialised channel(s) in **${prontoCategory.name}**, feel free to move and/or rename them!`)
						.addField('More Information', 'To see a full list of linked channels or change my configuration, please visit my dashboard.')
						.setFooter(dtg());

					sendMsg(debugChannel, embed);
				}
			});
	}

	catch (error) { console.log(error); }

	return newChannel.id;
}

function findRole(name, guild) {
	try { return guild.roles.cache.find(role => role.name.toLowerCase().includes(name.toLowerCase())).id; }
	catch { return ''; }
}