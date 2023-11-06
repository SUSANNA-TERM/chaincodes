'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const Asset = require('./asset');

class ReadingsBridge extends Asset {

    async MeterStatusesToMeters(ctx, meterStatuses, collection) {
        meterStatuses = JSON.parse(meterStatuses);

        const records = [];
        for (const meterStatus of meterStatuses) {
            const record = await this.ReadAsset(ctx, 'metertometerstatus', String(meterStatus.meterstatus_id), collection);
            records.push(JSON.parse(record));
        }

        return Array.from(new Set(records.map(record => record.meter_id)));
    }

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

        // Write to metertometerstatus table using CreateAsset function, only if the reading doesn't exist
        if (!await this.AssetExists(ctx, 'metertometerstatus', String(meterStatus.meterstatus_id), collection)) {
            await this.CreateAsset(ctx, 'metertometerstatus', String(meterStatus.meterstatus_id), meterToMeterStatus, collection);
        }

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
