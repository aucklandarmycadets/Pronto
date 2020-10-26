'use strict';

const dateFormat = require('dateformat');
const { config: { dateOutput } } = require('../config');

module.exports = date => dateFormat(date, dateOutput);