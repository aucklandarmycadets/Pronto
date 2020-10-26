'use strict';

const { config: { prefix } } = require('../config');

module.exports = cmd => `${prefix}${cmd.cmd}`;