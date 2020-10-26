'use strict';

module.exports = raw => {
	let years = 0;
	let months = 0;
	let days = 0;
	let hours = 0;
	let minutes = 0;
	let seconds = 0;

	if (raw > 31556952000) years = Math.floor(raw / 31556952000);
	if ((raw - (years * 31556952000)) > 2629800000) months = Math.floor((raw - (years * 31556952000)) / 2629800000);
	if ((raw - (years * 31556952000) - (months * 2629800000)) > 86400000) days = Math.floor((raw - (years * 31556952000) - (months * 2629800000)) / 86400000);
	if ((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000)) > 3600000) hours = Math.floor((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000)) / 3600000);
	if ((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000) - (hours * 3600000)) > 60000) minutes = Math.floor((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000) - (hours * 3600000)) / 60000);
	if ((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000) - (hours * 3600000) - (minutes * 60000)) > 1000) seconds = Math.floor((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000) - (hours * 3600000) - (minutes * 60000)) / 1000);

	if (years) return `${years} years, ${months} months, ${days} days`;
	else if (months) return `${months} months, ${days} days, ${hours} hrs`;
	else if (days) return `${days} days, ${hours} hrs, ${minutes} min`;
	else if (hours) return `${hours} hrs, ${minutes} min, ${seconds} sec`;
	else if (minutes) return `${minutes} min, ${seconds} sec`;
	else return `${seconds} sec`;
};
