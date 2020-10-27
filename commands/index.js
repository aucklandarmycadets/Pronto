'use strict';

const commandLoader = require('../handlers/commandLoader');

module.exports = async guild => await commandLoader('./commands', guild);