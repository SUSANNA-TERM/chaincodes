'use strict';

const Asset = require('./lib/asset');
const Info = require('./lib/info');
const Readings = require('./lib/readings');
const ReadingsBridge = require('./lib/readings-bridge');

module.exports.Asset = Asset;
module.exports.Info = Info;
module.exports.Readings = Readings;
module.exports.ReadingsBridge = ReadingsBridge;
module.exports.contracts = [Asset, Info, Readings, ReadingsBridge];