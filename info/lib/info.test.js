
'use strict';

const { Context } = require('fabric-contract-api');
const Info = require('../lib/info.js');

describe('Asset Transfer Basic Tests', () => {
    let ctx, stub, asset;
    beforeEach(() => {
        ctx = new Context();

        stub = jest.fn(() => ({
            putState: jest.fn(),
            getState: jest.fn(),
            deleteState: jest.fn(),
            getStateByRange: jest.fn(),
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

            let info = new Info();

            await expect(info.CreateAsset(ctx, asset)).rejects.toThrow('failed inserting key');
        });

        it('should return success on CreateAsset', async () => {
            let info = new Info();
            await info.CreateAsset(ctx, asset);

            let ret = JSON.parse((await stub.getState(asset.id)).toString());
            expect(ret).toEqual(asset);
        });
    });

    describe('Test ReadAsset', () => {
        it('should return error on ReadAsset', async () => {
            let info = new Info();
            await info.CreateAsset(ctx, asset);

            await expect(info.ReadAsset(ctx, 'asset2')).rejects.toThrow('The asset asset2 does not exist');
        });

        it('should return success on ReadAsset', async () => {
            let info = new Info();
            await info.CreateAsset(ctx, asset);

            let ret = JSON.parse(await stub.getState(asset.id));
            expect(ret).toEqual(asset);
        });
    });

    describe('Test UpdateAsset', () => {
        it('should return error on UpdateAsset', async () => {
            let info = new Info();
            await info.CreateAsset(ctx, asset);

            await expect(info.UpdateAsset(ctx, {
                id: 'asset2',
                Color: 'orange',
                Size: 10,
                Owner: 'Me',
                AppraisedValue: 500
            })).rejects.toThrow('The asset asset2 does not exist');
        });

        it('should return success on UpdateAsset', async () => {
            let info = new Info();
            await info.CreateAsset(ctx, asset);

            const newAsset = {
                id: 'asset1',
                Color: 'orange',
                Size: 10,
                Owner: 'Me',
                AppraisedValue: 500
            };
            await info.UpdateAsset(ctx, newAsset);
            let ret = JSON.parse(await stub.getState(asset.id));
            expect(ret).toEqual(newAsset);
        });
    });

    describe('Test DeleteAsset', () => {
        it('should return error on DeleteAsset', async () => {
            let info = new Info();
            await info.CreateAsset(ctx, asset);

            await expect(info.DeleteAsset(ctx, 'asset2')).rejects.toThrow('The asset asset2 does not exist');
        });

        it('should return success on DeleteAsset', async () => {
            let info = new Info();
            await info.CreateAsset(ctx, asset);

            await info.DeleteAsset(ctx, asset.id);
            let ret = await stub.getState(asset.id);
            expect(ret).toBeUndefined();
        });
    });
});