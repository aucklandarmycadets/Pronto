'use strict';

const { debugError } = require('../handlers');

module.exports = (destination, options) => destination.send(options).catch(error => debugError(error, `Error sending message to ${destination}.`));