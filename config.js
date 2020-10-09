'use strict';

const config = {
	prefix: '!',
	permsInt: 1879141584,
	dateOutput: 'HHMM "h" ddd, dd mmm yy',
	version: '2.0.1',
};

const ids = {
	serverID: '285276130284404750',
	devID: '192181901065322496',
	debugID: '760745439225577482',
	logID: '761907992332861440',
	attendanceID: '760820697542426644',
	recruitingID: '761160822008315915',
	newMembersID: '761162254498136084',
	archivedID: '761180123336146974',
	tacticalID: '285345887365103628',
	classroomID: '761191298614558720',
	visitorID: '285284113655791617',
	administratorID: '285282768286646272',
	formations: ['285282771189104640', '285283751695745033'],
	nonCadet: ['285284113655791617'],
	tacPlus: ['285282771189104640', '285283924542881792', '285283751695745033', '285283460078239785', '285282768286646272'],
	sgtPlus: ['285283924542881792', '285283751695745033', '285283460078239785', '285282768286646272'],
	cqmsPlus: ['285283751695745033', '285283460078239785', '285282768286646272'],
	adjPlus: ['285283460078239785', '285282768286646272'],
};

const emojis = {
	successEmoji: 'success',
	errorEmoji: 'error',
};

const colours = {
	default: 0x1b1b1b,
	pronto: 0xffd456,
	leave: 0xd31145,
	success: 0x45bb8a,
	warn: 0xffcc4d,
	error: 0xef4949,
};

module.exports = {
	config: config,
	ids: ids,
	emojis: emojis,
	colours: colours,
};