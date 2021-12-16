/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class SecuritizedAssetContract extends Contract {

    async securitizedAssetExists(ctx, securitizedAssetId) {
        const buffer = await ctx.stub.getState(securitizedAssetId);
        return (!!buffer && buffer.length > 0);
    }

    async createSecuritizedAsset(ctx, securitizedAssetId, value) {
        const exists = await this.securitizedAssetExists(ctx, securitizedAssetId);
        if (exists) {
            throw new Error(`The securitized asset ${securitizedAssetId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(securitizedAssetId, buffer);
    }

    async readSecuritizedAsset(ctx, securitizedAssetId) {
        const exists = await this.securitizedAssetExists(ctx, securitizedAssetId);
        if (!exists) {
            throw new Error(`The securitized asset ${securitizedAssetId} does not exist`);
        }
        let iterator = await ctx.stub.getHistoryForKey(securitizedAssetId);
        let result = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value) {
                console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
                const obj = JSON.parse(res.value.value.toString('utf8'));
                result.push(obj);
            }
            res = await iterator.next();
        }
        await iterator.close();

        return result;
    }

    async updateSecuritizedAsset(ctx, securitizedAssetId, newValue) {
        const exists = await this.securitizedAssetExists(ctx, securitizedAssetId);
        if (!exists) {
            throw new Error(`The securitized asset ${securitizedAssetId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(securitizedAssetId, buffer);
    }

    async deleteSecuritizedAsset(ctx, securitizedAssetId) {
        const exists = await this.securitizedAssetExists(ctx, securitizedAssetId);
        if (!exists) {
            throw new Error(`The securitized asset ${securitizedAssetId} does not exist`);
        }
        await ctx.stub.deleteState(securitizedAssetId);
    }

}

module.exports = SecuritizedAssetContract;
