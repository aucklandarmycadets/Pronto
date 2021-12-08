'use strict';

const { debugError, embedScaffold, findGuildConfiguration } = require('../handlers');

module.exports = async (msgs, chnl, collector) => {
	const { colours } = await findGuildConfiguration(chnl.guild);

	chnl.bulkDelete(msgs)
		.catch(error => {
			embedScaffold(null, chnl, `Error purging ${chnl}.`, colours.error, 'MESSAGE');
			debugError(error, `Error purging ${chnl}.`);
		});

	if (collector) collector.stop();
};