'use strict';

/**
 * `modules.enumerateResources()` enumerates a \<string[]> of submitted lesson resources,
 * by ordering any \<MessageAttachment> links first, then numbering any URL resources as [Resource n]
 *
 * @example
 * // returns ['[Message_Attachment_Name](https://cdn.discordapp.com/attachments/...)', '[Resource 1](https://...)', '[Resource 2](https://...)']
 * modules.enumerateResources(['[Resource](https://...)', '[Message_Attachment_Name](https://cdn.discordapp.com/attachments/...)', '[Resource](https://...)']);
 *
 * @example
 * // returns ['[Message_Attachment_Name](https://cdn.discordapp.com/attachments/...)', '[Resource 1](https://...)', '[Resource 2](https://...)']
 * modules.enumerateResources(['[Message_Attachment_Name](https://cdn.discordapp.com/attachments/...)\n[Resource](https://...)', '[Resource](https://...)']);
 *
 * @example
 * // returns {string}:
 * // [Message_Attachment_Name](https://cdn.discordapp.com/attachments/...)\n
 * // [Resource 1](https://...)\n
 * // [Resource 2](https://...)
 * modules.enumerateResources(['[Resource](https://...)', '[Message_Attachment_Name](https://cdn.discordapp.com/attachments/...)', '[Resource](https://...)'], true);
 *
 * @example
 * // returns 'N/A'
 * modules.enumerateResources([], true);
 *
 * @function modules.enumerateResources
 * @param {string[]} array A \<string[]> of the lesson resources to enumerate
 * @param {boolean} [toString] Whether to return the enumerated resources as a \<string[]> or a newline-delimited \<string>
 * @returns {string | string[]} A newline-separated \<string>, or a \<string[]> of the enumerated resources
 * - If the input \<string[]> is empty, a \<string> | \<string[]> of `N/A` will be returned
 */
module.exports = (array, toString) => {
	// Split apart any potential string[] elements which contain both a <MessageAttachment> and a URL, and return a flattened string[]
	const processedArray = array.flatMap(resource => resource.split('\n'));

	// Filter processedArray for any <MessageAttachment> resources, and store in a new string[]
	const attachmentArray = processedArray.filter(resource => !resource.startsWith('[Resource]'));

	// Filter processedArray for URL resources, then map to a new string[] of enumerated [Resource n] strings
	const urlArray = processedArray.filter(resource => resource.startsWith('[Resource]'))
		.map((resource, i) => `[Resource ${i + 1}]${resource.replace('[Resource]', '')}`);

	// Concatenate the URL string[] to the <MessageAttachment> resource string[]
	const combinedArr = attachmentArray.concat(urlArray);

	return (combinedArr.length)
		// If the concatenated string[] is not empty, return either a newline-separated string or the string[] depending on the toString boolean
		? (toString)
			? combinedArr.join('\n')
			: combinedArr
		// Otherwise, return either a string or single-element string[] of 'N/A'
		: (toString)
			? 'N/A'
			: ['N/A'];
};