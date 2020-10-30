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

exports.names = {
	debug: 'debugging',
	log: 'log-channel',
	attendance: 'attendance',
	recruiting: 'recruiting',
	newMembers: 'new-members',
	archived: 'Archived',
	exampleText: 'example-text',
	exampleVoice: 'example-voice',
	visitor: 'visitor',
	administrator: 'administrator',
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