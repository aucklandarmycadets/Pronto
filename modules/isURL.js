'use strict';

module.exports = str => {
	try { new URL(str); }
	catch { return false; }

	return true;
};