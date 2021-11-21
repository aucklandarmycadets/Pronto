'use strict';

module.exports = (arr, toString) => {
	let procArr = [];
	const linksArr = [];
	const outputArr = [];
	let count = 1;

	for (let i = 0; i < arr.length; i++) {
		procArr = procArr.concat(arr[i].split('\n'));
	}

	for (let i = 0; i < procArr.length; i++) {
		if (procArr[i].substr(0, 10) === '[Resource]') {
			linksArr.push(`[Resource ${count}]${procArr[i].substring(10)}`);
			count++;
		}
		else outputArr.push(`${procArr[i]}`);
	}

	return (outputArr.concat(linksArr).length)
		? (toString)
			? outputArr.concat(linksArr).join('\n')
			: outputArr.concat(linksArr)
		: (toString)
			? 'N/A'
			: ['N/A'];
};