'use strict';

const Asset = require('./asset');

class Readings extends Asset {

    async Query(ctx, queryString, collection) {
        const iterator = collection
            ? (await ctx.stub.getPrivateDataQueryResult(collection, queryString)).iterator
            : await ctx.stub.getQueryResult(queryString);

        return this._parseIterator(iterator);
    }
}

module.exports = Readings;
