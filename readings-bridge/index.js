'use strict';

const ReadingsBridge = require('./lib/readings-bridge');
const Asset = require('./lib/asset');

module.exports.ReadingsBridge = ReadingsBridge;
module.exports.Asset = Asset
module.exports.contracts = [ReadingsBridge, Asset];
