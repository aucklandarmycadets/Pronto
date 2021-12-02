'use strict';

module.exports = (raw, elapsed) => {
	const units = {
		0: 'year',
		1: 'month',
		2: 'day',
		3: 'hr',
		4: 'min',
		5: 'sec',
	};

	const durations = [31556952000, 2629800000, 86400000, 3600000, 60000, 1000];

	if (!elapsed) raw = Date.now() - raw;

	return durations.map((duration, i) => {
		const unitValue = Math.floor(raw / duration);
		raw %= duration;
		return (unitValue > 0)
			? `${unitValue} ${(unitValue > 1) ? `${units[i]}s` : units[i]}`
			: '';
	})
		.filter(string => string !== '')
		.slice(0, 3)
		.join(', ');
};
