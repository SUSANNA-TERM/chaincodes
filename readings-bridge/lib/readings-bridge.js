'use strict';

const Asset = require('./asset');

class ReadingsBridge extends Asset {


    async processMeterStatus(ctx, meterStatusString) {
        // Parse the input string to an object
        const meterStatus = JSON.parse(meterStatusString);

        // Calculate consumption
        const consumption = meterStatus.value - meterStatus.lastval;

        // Prepare data for metertometerstatus table
        const sensorDate = new Date(meterStatus.sensor_date);
        const id = sensorDate.getTime().toString();
        const meterToMeterStatus = stringify(sortKeysRecursive(JSON.parse({
            id,
            meter_id: meterStatus.meter_id,
            meterstatus_id: meterStatus.meterstatus_id
        })));

        // Write to metertometerstatus table using CreateAsset function
        await this.CreateAsset(ctx, 'metertometerstatus', id, JSON.stringify(meterToMeterStatus));

        // TODO: Retrieve location_id from Meters table using meter_id and invokeChaincode
        const processedMeterStatus = {
            ...meterStatus,
            consumption
        };
        delete processedMeterStatus.lastval;
        delete processedMeterStatus.meter_id;

        return processedMeterStatus;
    }
}

module.exports = ReadingsBridge;
