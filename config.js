'use strict';

exports.settings = {
	PERMISSIONS_INTEGER: 1879141584,
	prefix: '!',
	longDate: 'HHMM "h" ddd, d mmm yy',
	shortDate: 'd mmm',
	prontoLogo: 'https://i.imgur.com/Whgm87R.png',
	lessonCron: '0 16 * * 3',
};

exports.ids = {
	DEFAULT_GUILD: '765758073942966272',
	DEVELOPER_ID: '192181901065322496',
};

exports.defaults = {
	debug: {
		name: 'debugging',
		get description() {
			const { bot } = require('./pronto');
			return `For debugging <@!${bot.user.id}>.`;
		},
	},
	log: {
		name: 'log-channel',
		description: 'Log channel.',
	},
	attendance: {
		name: 'attendance',
		description: 'To assist in **recording attendance** and **monitoring leave**; leave tickets will be sent here.',
	},
	recruiting: {
		name: 'recruiting',
		description: 'For everything related to **recruitment**.',
	},
	welcome: {
		name: 'welcome',
		description: '**Introduce yourself!** You can ask us any questions you might have here, or just say hello!',
	},
	lessonReference: {
		name: 'reference',
		get description() {
			const { bot } = require('./pronto');
			return `Reference channel for <@!${bot.user.id}>'s **lesson plans** feature set.`;
		},
		get parent() {
			const { defaults } = require('./config');
			return defaults.lessons.name;
		},
	},
	lessonPlans: {
		name: 'lesson-plans',
		description: 'An archive of **completed** and **approved** lesson plans.',
		get parent() {
			const { defaults } = require('./config');
			return defaults.lessons.name;
		},
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