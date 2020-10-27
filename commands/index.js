'use strict';

const { indexProc } = require('../modules');

module.exports = async guild => await indexProc('./commands', guild);