'use strict';

/**
 *
 * @param {*} array
 * @param {*} toString
 * @returns
 */
module.exports = (array, toString) => {
	// Split apart any potential string[] elements which contain both a <MessageAttachment> and a URL, and return a flattened string[]
	const processedArray = array.flatMap(resource => resource.split('\n'));

	// Filter processedArray for any <MessageAttachment> resources, and store in a new string[]
	const attachmentArray = processedArray.filter(resource => !resource.startsWith('[Resource]'));

	// Filter processedArray for URL resources, then map to a new string[] of enumerated [Resource n] strings
	const urlArray = processedArray.filter(resource => resource.startsWith('[Resource]'))
		.map((resource, i) => `[Resource ${i + 1}]${resource.replace('[Resource]', '')}`);

	// Concantenate the URL string[] to the <MessageAttachment> resource string[]
	const combinedArr = attachmentArray.concat(urlArray);

	return (combinedArr.length)
		// If the concantenated string[] is not empty, return either a newline-separated string or the string[] depending on the toString boolean
		? (toString)
			? combinedArr.join('\n')
			: combinedArr
		// Otherwise, return either a string or single-element string[] of 'N/A'
		: (toString)
			? 'N/A'
			: ['N/A'];
};