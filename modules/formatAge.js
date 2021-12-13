'use strict';

/**
 * An object of each unit of time, and the duration of that unit in milliseconds
 */
const UNIT_DURATIONS = {
	'year': 31556952000,
	'month': 2629800000,
	'day': 86400000,
	'hr': 3600000,
	'min': 60000,
	'sec': 1000,
};

/**
 * `modules.formatAge()` formats a duration of time or a historical Unix timestamp (ms) into a formatted string
 * describing the elapsed duration
 *
 * @example
 * // returns '21 days, 9 hrs, 6 min'
 * modules.formatAge(1847160000, true);
 *
 * @function modules.formatAge
 * @param {number} raw A duration of elapsed time in milliseconds, or a Unix timestamp (ms) in the past
 * @param {boolean} [isElapsed=false] Whether `raw` is a duration of elapsed time, or is a timestamp whose duration since must be calculated
 * @returns {string} The formatted string describing the elapsed duration
 */
module.exports = (raw, isElapsed = false) => {
	// If the provided raw value is not an elapsed duration, calculate the time elapsed between the provided timestamp to the current time
	if (!isElapsed) raw = Date.now() - raw;

	// Map the duration values to a new string[] of each individual unit quantity
	// i.e. ['', '', '21 days', '9 hrs', '6 min', '']
	return Object.entries(UNIT_DURATIONS).map(([unit, duration]) => {
		// Calculate the unit value of the elapsed duration for this unit duration of time
		const unitValue = Math.floor(raw / duration);

		// Replace the elapsed duration with the remainder after division by this unit duration of time
		raw %= duration;

		return (unitValue > 0)
			// If the unit value for this unit duration of time is non-zero, set the mapped value to be the calculated unit quantity accompanied by the unit (pluralised if necessary)
			? `${unitValue} ${(unitValue > 1) ? `${unit}s` : unit}`
			// If the unit value for this unit duration of time is zero, set the mapped value to be an empty string ''
			: '';
	})
		// Filter the new string[] for non-zero unit quantities
		.filter(str => str !== '')
		// Join the 3 most-significant unit quantities in the filtered string[] with a ', ' separator and then return the new string
		.slice(0, 3)
		.join(', ');
};
