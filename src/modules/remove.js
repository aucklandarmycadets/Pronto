'use strict';

/**
 * `modules.remove()` finds and removes a specified element from an \<any[]>, or removes the element at a specified index,
 * and returns the resultant array
 *
 * @example
 * // returns [0, 2]
 * modules.remove([0, 1, 2], null, 1);
 *
 * @example
 * // returns ['Zero', 'Two', 'Three']
 * modules.remove(['Zero', 'Pronto', 'Two', 'Three'], 'Pronto');
 *
 * @example
 * // returns ['Zero', 'One', 'Two']
 * modules.remove(['Zero', 'One', 'Two', 'Three'], 'One', 3);
 *
 * @example
 * // returns [0, 1, 2, 3]
 * modules.remove([0, 1, 2, 3], null, 5);
 *
 * @function modules.remove
 * @param {any[]} array The \<any[]> to remove an element from
 * @param {?any} element The element to remove from the \<any[]>
 * - **NOTE:** If an `index` is specified, this argument will be ignored and the `index` element will be removed
 * @param {number} [index] The index of the element to remove from the \<any[]>
 * @returns {any[]} The \<any[]> with the element removed
 */
module.exports = (array, element, index) => {
	// If no index was specified, find the index of the specified element
	if (index == undefined) index = array.indexOf(element);
	// If the index is valid, remove the element at the index from the array
	if (index !== -1 && index < array.length) array.splice(index, 1);
	// Return the mutated array
	return array;
};