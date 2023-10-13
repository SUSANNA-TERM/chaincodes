'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class Asset extends Contract {

    _createCompositeKey(stub, asset, ...params) {
        return stub.createCompositeKey(asset, params)
    }

    _getData(stub, asset, collection, ...params) {
        const key = this._createCompositeKey(stub, asset, ...params)
        return collection
            ? stub.getPrivateData(collection, key)
            : stub.getState(key);
    }

    async _getDataByPartialCompositeKey(stub, asset, collection, ...params) {
        const results = collection
            ? await stub.getPrivateDataByPartialCompositeKey(collection, asset, params)
            : await stub.getStateByPartialCompositeKey(asset, params);
        return this._parseIterator(results);
    }

    async _parseIterator(iterator) {
        const allResults = [];
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return stringify(sortKeysRecursive(JSON.parse(allResults)))
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, asset, id, data, collection) {
        if (await this.AssetExists(ctx, asset, id, collection)) {
            throw new Error(`The asset ${asset} with id ${id} already exists`);
        }

        const key = this._createCompositeKey(ctx.stub, asset, id);
        const dataBuffer = Buffer.from(stringify(sortKeysRecursive(JSON.parse(data))));
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        collection
            ? await ctx.stub.putPrivateData(collection, key, dataBuffer)
            : await ctx.stub.putState(key, dataBuffer);
        return data;
    }


    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, asset, id, collection) {
        const assetJSON = await this._getData(ctx.stub, asset, collection, id);

        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${asset} with id ${id} does not exist`);
        }

        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, asset, id, data, collection) {
        data = JSON.parse(data);
        const oldAsset = JSON.parse(await this.ReadAsset(ctx, asset, id, collection));

        // overwriting original asset with new asset
        const newAsset = {
            ...oldAsset,
            ...data
        };

        const key = this._createCompositeKey(ctx.stub, asset, id);
        const dataBuffer = Buffer.from(stringify(sortKeysRecursive(newAsset)));
        // we insert the updated JSON corresponding to the given id
        collection
            ? await ctx.stub.putPrivateData(collection, key, dataBuffer)
            : await ctx.stub.putState(key, dataBuffer);
        return JSON.stringify(newAsset);
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, asset, id, collection) {
        const exists = await this.AssetExists(ctx, asset, id, collection);
        if (!exists) {
            throw new Error(`The asset ${asset} with id ${id} does not exist`);
        }

        const key = this._createCompositeKey(ctx.stub, asset, id);
        collection
            ? await ctx.stub.deletePrivateData(collection, key)
            : await ctx.stub.deleteState(key);
    }

    // AssetExists returns true when asset with given id exists in world state.
    async AssetExists(ctx, asset, id, collection) {
        const key = this._createCompositeKey(ctx.stub, asset, id);
        const assetJSON = collection
            ? await ctx.stub.getPrivateData(collection, key)
            : await ctx.stub.getState(key);
        return assetJSON && assetJSON.length > 0;
    }

    // GetAllAssets returns all records of a specified asset
    GetAllAssets(ctx, asset, collection) {
        return this._getDataByPartialCompositeKey(ctx.stub, asset, collection);
    }
}

module.exports = Asset;
