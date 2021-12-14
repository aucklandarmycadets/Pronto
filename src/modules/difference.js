'use strict';

/**
 * `modules.difference()` finds and returns the difference between two arrays, where each
 * element exists in only one of the provided arrays
 *
 * @example
 * // returns [0, 2]
 * modules.difference([0, 1, 3], [1, 2, 3]);
 *
 * @function modules.difference
 * @param {any[]} arrayOne The first \<any[]> to compare
 * @param {any[]} arrayTwo The second \<any[]> to compare
 * @returns {any[]} The \<any[]> of the elements that differ
 */
module.exports = (arrayOne, arrayTwo) => {
	// Return the expanded filtered arrays as a single any[]
	return [
		// Filter arrayOne for values that do not exist in arrayTwo, and expand the filtered array using spread syntax
		...arrayOne.filter(value => arrayTwo.indexOf(value) === -1),
		// Filter arrayTwo for values that do not exist in arrayOne, and expand the filtered array using spread syntax
		...arrayTwo.filter(value => arrayOne.indexOf(value) === -1),
	];
};