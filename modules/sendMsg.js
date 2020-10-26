'use strict';

const { debugError } = require('./');

module.exports = (dest, msg) => dest.send(msg).catch(error => debugError(error, `Error sending message to ${dest}.`));