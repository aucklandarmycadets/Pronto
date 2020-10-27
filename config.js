'use strict';

exports.config = {
	prefix: '!',
	permsInt: 1879141584,
	dateOutput: 'HHMM "h" ddd, dd mmm yy',
	prontoLogo: 'https://i.imgur.com/EzmJVyV.png',
	devID: '192181901065322496',
};

exports.ids = {
	serverID: '765758073942966272',
	devID: '192181901065322496',
	debugID: '765767054111539240',
	logID: '765767003993538570',
	attendanceID: '765767029335523380',
	recruitingID: '765767802849329202',
	newMembersID: '765767873476952074',
	archivedID: '765767942730022912',
	exampleTextID: '765768009670721556',
	exampleVoiceID: '765768380317433916',
	everyoneID: '765758073942966272',
	visitorID: '765768798972018698',
	administratorID: '765768990823809127',
	formations: ['765769247245860914'],
	nonCadet: ['765768798972018698'],
	tacPlus: ['765769019546271794', '765769110079537154', '765769149124575247', '765769177646235678', '765768990823809127'],
	sgtPlus: ['765770454451224577', '765769781655371826', '765769827121233930', '765770489754288159', '765769882972848159', '765769929495674911', '765769177646235678', '765768990823809127'],
	cqmsPlus: ['765769827121233930', '765769882972848159', '765769929495674911', '765769177646235678', '765768990823809127'],
	adjPlus: ['765769929495674911', '765769177646235678', '765768990823809127'],
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