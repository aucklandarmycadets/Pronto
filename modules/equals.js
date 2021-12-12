'use strict';

/**
 * `modules.equals()` determines whether two arrays are identical, with all elements in the same order
 * - **WARNING:** This implementation will produce unpredictable results with nested arrays or object elements
 *
 * @example
 * // returns true
 * modules.equals([1, 2, 3], [1, 2, 3]);
 *
 * @example
 * // returns false
 * modules.equals([1, 2, 3], [3, 2, 1]);
 *
 * @function modules.equals
 * @param {any[]} arrayOne The first \<any[]> to compare
 * @param {any[]} arrayTwo The second \<any[]> to compare
 * @returns {boolean} Whether the two arrays are identical
 */
module.exports = (arrayOne, arrayTwo) => {
	// If the two arrays share the same reference, they must be identical
	if (arrayOne === arrayTwo) return true;
	// If the two arrays do not share the same length, they must be different
	if (arrayOne.length !== arrayTwo.length) return false;

	// If the two arrays have the same length, check if all elements of arrayOne match the element of arrayTwo at the same index
	return arrayOne.every((element, i) => element === arrayTwo[i]);
};