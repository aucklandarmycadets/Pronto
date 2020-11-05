'use strict';

exports.config = {
	prefix: '!',
	permsInt: 1879141584,
	dateOutput: 'HHMM "h" ddd, d mmm yy',
	prontoLogo: 'https://i.imgur.com/EzmJVyV.png',
};

exports.ids = {
	defaultServer: '748336465465049230',
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
	lessonPlans: {
		name: 'lesson-plans',
		desc: 'An archive of **completed** and **approved** lesson plans.',
		get parent() {
			const { defaults } = require('./config');
			delete this.parent;
			return this.parent = defaults.lessons.name;
		},
	},
	exampleText: {
		name: 'example-text',
		get desc() {
			const { bot } = require('./pronto');
			delete this.desc;
			return this.desc = `Example **text channel** used in <@!${bot.user.id}>'s command descriptions.`;
		},
	},
	exampleVoice: {
		name: 'example-voice',
	},
	pronto: {
		name: 'Pronto',
	},
	archived: {
		name: 'Archived',
	},
	lessons: {
		name: 'Lesson Plans',
	},
	visitor: {
		name: 'visitor',
	},
	administrator: {
		name: 'administrator',
	},
};

exports.emojis = {
	success: {
		name: 'success',
		URL: 'https://i.imgur.com/OMi5RLT.png',
	},
	error: {
		name: 'error',
		URL: 'https://i.imgur.com/DW8EJJ7.png',
	},
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