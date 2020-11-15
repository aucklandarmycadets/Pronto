'use strict';

module.exports = async (msgs, chnl, collector) => {
	const { debugError, embedScaffold } = require('./');
	const { colours } = await require('../handlers/database')(chnl.guild);

	chnl.bulkDelete(msgs)
		.catch(error => {
			embedScaffold(null, chnl, `Error purging ${chnl}.`, colours.error, 'msg');
			debugError(error, `Error purging ${chnl}.`);
		});

	if (collector) collector.stop();
};