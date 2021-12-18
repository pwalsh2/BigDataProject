/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const moment = require('moment');
class SecuritizedAssetContract extends Contract {

    async securitizedAssetExists(ctx, securitizedAssetId) {
        const buffer = await ctx.stub.getState(securitizedAssetId);
        return (!!buffer && buffer.length > 0);
    }

    async createSecuritizedAsset(ctx, securitizedAssetId, value1, value2) {
        const exists = await this.securitizedAssetExists(ctx, securitizedAssetId);
        if (exists) {
            throw new Error(`The securitized asset ${securitizedAssetId} already exists`);
        }
        const asset = { value1, value2 };
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

    getCurrentTime(){
        let now = moment();
        return now.format();
    }

    convertTimeStamp(UNix_Time){
        // Create a new JavaScript Date object based on the timestamp
        // multiplied by 1000 so that the argument is in milliseconds, not seconds.
        let d = new Date(UNix_Time * 1000),yyyy = d.getFullYear(), mm = ('0' + (d.getMonth() + 1)).slice(-2), dd = ('0' + d.getDate()).slice(-2),hh = d.getHours(),h = hh,min = ('0' + d.getMinutes()).slice(-2),ampm = 'AM',time;
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
        return time;

    }

    async generateM1(ctx, securitizedAssetId, NumTimeIntervals) {
        const exists = await this.securitizedAssetExists(ctx, securitizedAssetId);
        if (!exists) {
            throw new Error(`The securitized asset ${securitizedAssetId} does not exist`);
        }
        let iterator = await ctx.stub.getHistoryForKey(securitizedAssetId);
        let values = [];
        let times = [];
        let res = await iterator.next();
        // get values and times from the iterator returned
        while (!res.done) {
            if (res.value) {
                console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
                console.log(res.value);
                const time =  res.value.timestamp.seconds.low;
                const obj =  this.convertTimeStamp(time);
                values.push(JSON.parse(res.value.value.toString('utf-8')));
                times.push(obj);
            }
            res = await iterator.next();
        }
        await iterator.close();
        //let numEvents = times.length;
        //let bucketedEvents = this.generateBuckets(numEvents, values, times);
        return [values, times];
    }
    async updateSecuritizedAsset(ctx, securitizedAssetId, newValue, newvalue2) {
        const exists = await this.securitizedAssetExists(ctx, securitizedAssetId);
        if (!exists) {
            throw new Error(`The securitized asset ${securitizedAssetId} does not exist`);
        }
        const asset = { value: newValue, value2:newvalue2 };
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


    async generateSD1(ctx){

        for(let i = 0 ; i < 400; i++){
            await this.createSecuritizedAsset(ctx, 's'+i, '', '');
            let event;
            for (let j = 0; j < 2000; j++){
                if(i%2 === 0){
                    event = {
                        tr:'tr',
                        t:moment().format(),
                        load:'ul'
                    };
                }
                else{
                    event = {
                        tr:'tr',
                        t:moment().format(),
                        load:'l'
                    };
                }
                await this.updateSecuritizedAsset(ctx, 's'+i, event, '');
            }
        }
        for(let i = 0 ; i < 100; i++){
            let event;
            await this.createSecuritizedAsset(ctx, 'c'+i, '', '');
            for (let j = 0; j < 2000; j++){
                if(i%2 === 0){
                    event = {
                        tr:'tr',
                        t:moment().format(),
                        load:'ul'
                    };
                }
                else{
                    event = {
                        tr:'tr',
                        t:moment().format(),
                        load:'l'
                    };
                }
                await this.updateSecuritizedAsset(ctx, 'c'+i, event, '');
            }
        }
    }
}

module.exports = SecuritizedAssetContract;
