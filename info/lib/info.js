'use strict';

const Asset = require('./asset');

class Info extends Asset {

    async GetAllMeters(ctx, collection) {
        const meters = JSON.parse(await this.GetAllAssets(ctx, 'meters', collection));

        return JSON.stringify(meters.map(({ id, address }) => ({ id, address })))
    }
}

module.exports = Info;
