'use strict';

/**
 * `modules.merge()` performs a deep merge of a `source` object into a `target` object,
 * by assigning any non-existing properties and overwriting values of existing properties
 * - Nested objects are recursed through, to ensure all properties of the `source` object are merged into `target`
 *
 * @example
 * const target = {
 * 	one: 1,
 * 	two: 2,
 * 	three: 3,
 * };
 *
 * const source = {
 * 	two: 20,
 * 	three: {
 * 		four: 4,
 * 	},
 * };
 *
 * // returns {
 * //     one: 1,
 * //     two: 20,
 * //     three: {
 * //         four: 4,
 * //     },
 * // }
 * modules.merge(target, source);
 *
 * @function modules.merge
 * @param {Object} target The target object to merge into
 * @param {Object} source The source object from which to copy properties
 * @returns {Object} The `source` object merged into the `target` object
 */
module.exports = (target, source) => {
	// Iterate through each key of the source object
	Object.keys(source).forEach(key => {
		// If the value is a nested object, use recursion to merge the nested source object into the target object
		if (source[key] instanceof Object) source[key] = { ...source[key], ...module.exports(target[key] || {}, source[key]) };
	});

	// Once all nested objects have been merged, perform a final merge on the remaining shallow properties
	// If the current target is null or undefined, pass an empty object instead
	// This may occur if the original source object has nested objects that are greater than one level deeper than the original target
	return { ...target || {}, ...source };
};