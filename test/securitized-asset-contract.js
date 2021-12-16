/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { SecuritizedAssetContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logger = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('SecuritizedAssetContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new SecuritizedAssetContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"securitized asset 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"securitized asset 1002 value"}'));
    });

    describe('#securitizedAssetExists', () => {

        it('should return true for a securitized asset', async () => {
            await contract.securitizedAssetExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a securitized asset that does not exist', async () => {
            await contract.securitizedAssetExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createSecuritizedAsset', () => {

        it('should create a securitized asset', async () => {
            await contract.createSecuritizedAsset(ctx, '1003', 'securitized asset 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"securitized asset 1003 value"}'));
        });

        it('should throw an error for a securitized asset that already exists', async () => {
            await contract.createSecuritizedAsset(ctx, '1001', 'myvalue').should.be.rejectedWith(/The securitized asset 1001 already exists/);
        });

    });

    describe('#readSecuritizedAsset', () => {

        it('should return a securitized asset', async () => {
            await contract.readSecuritizedAsset(ctx, '1001').should.eventually.deep.equal({ value: 'securitized asset 1001 value' });
        });

        it('should throw an error for a securitized asset that does not exist', async () => {
            await contract.readSecuritizedAsset(ctx, '1003').should.be.rejectedWith(/The securitized asset 1003 does not exist/);
        });

    });

    describe('#updateSecuritizedAsset', () => {

        it('should update a securitized asset', async () => {
            await contract.updateSecuritizedAsset(ctx, '1001', 'securitized asset 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"securitized asset 1001 new value"}'));
        });

        it('should throw an error for a securitized asset that does not exist', async () => {
            await contract.updateSecuritizedAsset(ctx, '1003', 'securitized asset 1003 new value').should.be.rejectedWith(/The securitized asset 1003 does not exist/);
        });

    });

    describe('#deleteSecuritizedAsset', () => {

        it('should delete a securitized asset', async () => {
            await contract.deleteSecuritizedAsset(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a securitized asset that does not exist', async () => {
            await contract.deleteSecuritizedAsset(ctx, '1003').should.be.rejectedWith(/The securitized asset 1003 does not exist/);
        });

    });

});
