'use strict';

module.exports = (array, toString) => {
	const processedArray = array.flatMap(resource => resource.split('\n'));

	const attachmentArray = processedArray.filter(resource => !resource.startsWith('[Resource]'));

	const urlArray = processedArray.filter(resource => resource.startsWith('[Resource]'))
		.map((resource, i) => `[Resource ${i + 1}]${resource.replace('[Resource]', '')}`);

	const combinedArr = attachmentArray.concat(urlArray);

	return (combinedArr.length)
		? (toString)
			? combinedArr.join('\n')
			: combinedArr
		: (toString)
			? 'N/A'
			: ['N/A'];
};