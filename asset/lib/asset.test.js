
'use strict';

const { Context } = require('fabric-contract-api');
const Asset = require('../lib/asset.js');

describe('Asset Transfer Basic Tests', () => {
    const collection = "privateCollection";
    let ctx, stub, asset;
    
    beforeEach(() => {
        ctx = new Context();

        stub = jest.fn(() => ({
            putState: jest.fn(),
            getState: jest.fn(),
            deleteState: jest.fn(),
            getStateByRange: jest.fn(),
            createCompositeKey: jest.fn(),
            putPrivateData: jest.fn(),
            getPrivateData: jest.fn(),
            deletePrivateData: jest.fn()
        }))();

        ctx.setChaincodeStub(stub);

        // Mocking stub methods
        stub.putState.mockImplementation((key, value) => {
            if (!stub.states) {
                stub.states = {};
            }
            stub.states[key] = value;
        });

        stub.getState.mockImplementation(async (key) => {
            let ret;
            if (stub.states) {
                ret = stub.states[key];
            }
            return Promise.resolve(ret);
        });

        stub.deleteState.mockImplementation(async (key) => {
            if (stub.states) {
                delete stub.states[key];
            }
            return Promise.resolve(key);
        });

        stub.createCompositeKey.mockImplementation((objectType, attributes) => {
            return `${objectType}${attributes.join('')}`;
        });

        stub.putPrivateData.mockImplementation((collection, key, value) => {
            if (!stub.privateStates) {
                stub.privateStates = {};
            }
            if (!stub.privateStates[collection]) {
                stub.privateStates[collection] = {};
            }
            stub.privateStates[collection][key] = value;
        });

        stub.getPrivateData.mockImplementation((collection, key) => {
            let ret;
            if (stub.privateStates && stub.privateStates[collection]) {
                ret = stub.privateStates[collection][key];
            }
            return Promise.resolve(ret);
        });

        stub.deletePrivateData.mockImplementation((collection, key) => {
            if (stub.privateStates && stub.privateStates[collection]) {
                delete stub.privateStates[collection][key];
            }
            return Promise.resolve(key);
        });

        asset = {
            id: 'asset1',
            Color: 'blue',
            Size: 5,
            Owner: 'Tomoko',
            AppraisedValue: 300,
        };
    });

    describe('Test CreateAsset', () => {
        it('should return error on CreateAsset', async () => {
            stub.putState.mockRejectedValue(new Error('failed inserting key'));

            let asset = new Asset();

            await expect(asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset))).rejects.toThrow('failed inserting key');
        });

        it('should return success on CreateAsset', async () => {
            let asset = new Asset();
            await asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset));

            let ret = JSON.parse((await stub.getState(stub.createCompositeKey('assetType', [asset.id]))).toString());
            expect(ret).toEqual(asset);
        });

        it('should return error on CreateAsset with private data', async () => {
            stub.putPrivateData.mockRejectedValue(new Error('failed inserting key'));

            let asset = new Asset();

            await expect(asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset), collection)).rejects.toThrow('failed inserting key');
        });

        it('should return success on CreateAsset with private data', async () => {
            let asset = new Asset();
            await asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset), collection);

            let ret = JSON.parse((await stub.getPrivateData(collection, stub.createCompositeKey('assetType', [asset.id]))).toString());
            expect(ret).toEqual(asset);
        });
    });

    describe('Test ReadAsset', () => {
        it('should return error on ReadAsset', async () => {
            let asset = new Asset();
            await asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset));

            await expect(asset.ReadAsset(ctx, 'assetType', 'asset2')).rejects.toThrow('The asset assetType with id asset2 does not exist');
        });

        it('should return success on ReadAsset', async () => {
            let asset = new Asset();
            await asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset));

            let ret = JSON.parse((await asset.ReadAsset(ctx, 'assetType', asset.id)).toString());
            expect(ret).toEqual(asset);
        });

        it('should return error on ReadAsset with private data', async () => {
            let asset = new Asset();
            await asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset), collection);

            await expect(asset.ReadAsset(ctx, 'assetType', 'asset2', collection)).rejects.toThrow('The asset assetType with id asset2 does not exist');
        });

        it('should return success on ReadAsset with private data', async () => {
            let asset = new Asset();
            await asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset), collection);

            let ret = JSON.parse((await asset.ReadAsset(ctx, 'assetType', asset.id, collection)).toString());
            expect(ret).toEqual(asset);
        });
    });

    describe('Test UpdateAsset', () => {
        it('should return error on UpdateAsset', async () => {
            let asset = new Asset();
            await asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset));

            const updateData = {
                id: 'asset2',
                Color: 'orange',
                Size: 10,
                Owner: 'Me',
                AppraisedValue: 500
            };

            await expect(asset.UpdateAsset(ctx, 'assetType', 'asset2', JSON.stringify(updateData))).rejects.toThrow('The asset assetType with id asset2 does not exist');
        });

        it('should return success on UpdateAsset', async () => {
            let asset = new Asset();
            await asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset));

            const updateData = {
                id: 'asset1',
                Color: 'orange',
                Size: 10,
                Owner: 'Me',
                AppraisedValue: 500
            };

            await asset.UpdateAsset(ctx, 'assetType', asset.id, JSON.stringify(updateData));
            let ret = JSON.parse(await stub.getState(stub.createCompositeKey('assetType', [asset.id])));
            expect(ret).toEqual({ ...asset, ...updateData });
        });

        it('should return error on UpdateAsset with private data', async () => {
            let asset = new Asset();
            await asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset), collection);

            const updateData = {
                id: 'asset2',
                Color: 'orange',
                Size: 10,
                Owner: 'Me',
                AppraisedValue: 500
            };

            await expect(asset.UpdateAsset(ctx, 'assetType', 'asset2', JSON.stringify(updateData), collection)).rejects.toThrow('The asset assetType with id asset2 does not exist');
        });

        it('should return success on UpdateAsset with private data', async () => {
            let asset = new Asset();
            await asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset), collection);

            const updateData = {
                id: 'asset1',
                Color: 'orange',
                Size: 10,
                Owner: 'Me',
                AppraisedValue: 500
            };

            await asset.UpdateAsset(ctx, 'assetType', asset.id, JSON.stringify(updateData), collection);
            let ret = JSON.parse(await stub.getPrivateData(collection, stub.createCompositeKey('assetType', [asset.id])));
            expect(ret).toEqual({ ...asset, ...updateData });
        });
    });

    describe('Test DeleteAsset', () => {
        it('should return error on DeleteAsset', async () => {
            let asset = new Asset();
            await asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset));

            await expect(asset.DeleteAsset(ctx, 'assetType', 'asset2')).rejects.toThrow('The asset assetType with id asset2 does not exist');
        });

        it('should return success on DeleteAsset', async () => {
            let asset = new Asset();
            await asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset));

            await asset.DeleteAsset(ctx, 'assetType', asset.id);
            let ret = await stub.getState(stub.createCompositeKey('assetType', [asset.id]));
            expect(ret).toBeUndefined();
        });

        it('should return error on DeleteAsset with private data', async () => {
            let asset = new Asset();
            await asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset), collection);

            await expect(asset.DeleteAsset(ctx, 'assetType', 'asset2', collection)).rejects.toThrow('The asset assetType with id asset2 does not exist');
        });

        it('should return success on DeleteAsset with private data', async () => {
            let asset = new Asset();
            await asset.CreateAsset(ctx, 'assetType', asset.id, JSON.stringify(asset), collection);

            await asset.DeleteAsset(ctx, 'assetType', asset.id, collection);
            let ret = await stub.getPrivateData(collection, stub.createCompositeKey('assetType', [asset.id]));
            expect(ret).toBeUndefined();
        });
    });
});