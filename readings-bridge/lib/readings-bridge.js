'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const Asset = require('./asset');

class ReadingsBridge extends Asset {


    async ProcessMeterStatus(ctx, meterStatus, collection) {
        // Parse the input string to an object
        meterStatus = JSON.parse(meterStatus);

        // Calculate consumption
        const consumption = meterStatus.value - meterStatus.lastval;

        // Prepare data for metertometerstatus table
        const meterToMeterStatus = stringify(sortKeysRecursive({
            consumption,
            meter_id: meterStatus.meter_id,
            meterstatus_id: meterStatus.meterstatus_id,
            sensor_date: meterStatus.sensor_date,
            total_consumption: meterStatus.value
        }));

        // Write to metertometerstatus table using CreateAsset function
        await this.CreateAsset(ctx, 'metertometerstatus', meterToMeterStatus.meterstatus_id, JSON.stringify(meterToMeterStatus), collection);

        // TODO: Retrieve location_id from Meters table using meter_id and invokeChaincode
        const processedMeterStatus = {
            ...meterStatus,
            consumption
        };
        delete processedMeterStatus.lastval;
        delete processedMeterStatus.meter_id;
        delete processedMeterStatus.value;

        return processedMeterStatus;
    }

    async Query(ctx, queryString, collection) {
        const iterator = collection
            ? (await ctx.stub.getPrivateDataQueryResult(collection, queryString)).iterator
            : await ctx.stub.getQueryResult(queryString);

        return this._parseIterator(iterator);
    }
}

module.exports = ReadingsBridge;
