'use strict';

const Readings = require('./lib/readings');
const Asset = require('./lib/asset');

module.exports.Readings = Readings;
module.exports.Asset = Asset
module.exports.contracts = [Readings, Asset];
