'use strict';

const Info = require('./lib/info');
const Asset = require('./lib/asset');

module.exports.Info = Info;
module.exports.Asset = Asset
module.exports.contracts = [Info, Asset];
