'use strict';

module.exports = (target, source) => merge(target, source);

function merge(target, source) {
	for (const key of Object.keys(source)) {
		if (source[key] instanceof Object) Object.assign(source[key], merge(target[key], source[key]));
	}

	Object.assign(target || {}, source);
	return target;
}