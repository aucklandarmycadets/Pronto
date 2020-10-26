'use strict';

const { colours } = require('../config');

module.exports = (msgs, chnl, collector) => {
	const { debugError, embedScaffold } = require('./');

	chnl.bulkDelete(msgs)
		.catch(error => {
			embedScaffold(chnl, `Error purging ${chnl}.`, colours.error, 'msg');
			debugError(error, `Error purging ${chnl}.`);
		});

	if (collector) collector.stop();
};