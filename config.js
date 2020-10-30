'use strict';

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

exports.defaults = {
	debug: {
		name: 'debugging',
		get desc() {
			const { bot } = require('./pronto');
			delete this.desc;
			return this.desc = `For debugging <@!${bot.user.id}>`;
		},
	},
	log: {
		name: 'log-channel',
		desc: 'Log channel.',
	},
	attendance: {
		name: 'attendance',
		desc: 'To assist in **recording attendance** and **monitoring leave**; leave tickets will be sent here.',
	},
	recruiting: {
		name: 'recruiting',
		desc: 'For everything related to **recruitment**.',
	},
	newMembers: {
		name: 'new-members',
		desc: '**Introduce yourself!** You can ask us any questions you might have here, or just say hello!',
	},
	exampleText: {
		name: 'example-text',
		get desc() {
			const { bot } = require('./pronto');
			delete this.desc;
			return this.desc = `Example **text channel** for <@!${bot.user.id}>'s command descriptions.`;
		},
	},
	exampleVoice: {
		name: 'example-voice',
	},
	archived: {
		name: 'Archived',
	},
	visitor: {
		name: 'visitor',
	},
	administrator: {
		name: 'administrator',
	},
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

exports.dbOptions = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	autoIndex: false,
	family: 4,
};