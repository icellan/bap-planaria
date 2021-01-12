import { describe, expect, beforeEach, afterEach, test, } from '@jest/globals';
import { Attest } from '../src/schemas/attest';
import { ID } from '../src/schemas/id';
import { handleAttestationTransaction } from '../src/attest';
import ids from './data/ids.json';

export const testData = {
  _id: '89dd7f7eada1909a286a3e08de85bfbebb5065f236b40f6996a3ff86cdf7bdcf',
  block: undefined,
  hash: '01a7f66949cf77788d3ce84f08d941d321c24e7d07ffa6dcb8d0e0b7a1d05922',
  sequence: '0',
  signatureAddress: '134a6TXxzgQ9Az3w8BcvgdZyA5UqRL89da',
  type: 'ATTEST',
  timestamp: 1610146262341,
};

export const testBlock = 647493;
export const testAttest = async function (includeBlock = true, sequence = 0) {
  const useTestData = Object.assign({}, testData);
  if (includeBlock) {
    useTestData.block = testBlock;
  } else {
    useTestData.block = undefined;
  }

  if (sequence) {
    // overwrite sequence
    useTestData.sequence = '' + sequence;
  }

  await handleAttestationTransaction(useTestData);

  return {
    attest: await Attest.findOne({
      _id: useTestData.hash,
    }),
    useTestData,
  };
};

const defaultExpectAttest = function(attest, useTestData) {
  expect(attest._id).toEqual(useTestData.hash);
  expect(attest.signers.length).toEqual(1);
  expect(attest.signers[0].idKey).toEqual(ids[0]._id);
  expect(attest.signers[0].address).toEqual(useTestData.signatureAddress);
  expect(attest.signers[0].txId).toEqual(useTestData._id);
  expect(attest.signers[0].sequence).toEqual(0);
  expect(attest.signers[0].block).toEqual(useTestData.block);
}

describe('handleAttestationTransaction', () => {
  beforeEach(async () => {
    await Attest.deleteMany({});
    await ID.deleteMany({});
    await ID.insert(ids[0]);
  });

  test('simple insert', async () => {
    const {
      attest,
      useTestData
    } = await testAttest();
    defaultExpectAttest(attest, useTestData);
  });

  test('second insert', async () => {
    await testAttest();
    await ID.insert(ids[1]);

    const testData2 = {
      _id: 'c692f0661d58ce6337a7be08ef67779af4b99fcea513a304bad7352ae46d5987',
      block: 624003,
      hash: '01a7f66949cf77788d3ce84f08d941d321c24e7d07ffa6dcb8d0e0b7a1d05922',
      sequence: '0',
      signatureAddress: '1AvzFCsUMM1t5DWxXYGvFxc3SvnLbgt1xb',
      type: 'ATTEST',
      timestamp: 1610146262341,
    };

    await handleAttestationTransaction(testData2);
    const attest = await Attest.findOne({
      _id: testData2.hash,
    });

    expect(attest._id).toEqual(testData2.hash);
    expect(attest.signers.length).toEqual(2);
    expect(attest.signers[1].idKey).toEqual(ids[1]._id);
    expect(attest.signers[1].address).toEqual(testData2.signatureAddress);
    expect(attest.signers[1].txId).toEqual(testData2._id);
    expect(attest.signers[1].sequence).toEqual(0);
    expect(attest.signers[1].block).toEqual(testData2.block);
  });

  test('simple insert from mempool', async () => {
    const { attest, useTestData } = await testAttest(false);
    defaultExpectAttest(attest, useTestData);
    expect(attest.block).toEqual(undefined);
  });

  test('insert with data', async () => {
    const testData2 = JSON.parse(JSON.stringify(testData));
    testData2.data = 'Some short test data';

    await handleAttestationTransaction(testData2);
    const attest = await Attest.findOne({
      _id: testData2.hash,
    });

    expect(attest._id).toEqual(testData2.hash);
    expect(attest.signers.length).toEqual(1);
    expect(attest.signers[0].idKey).toEqual(ids[0]._id);
    expect(attest.signers[0].address).toEqual(testData2.signatureAddress);
    expect(attest.signers[0].txId).toEqual(testData2._id);
    expect(attest.signers[0].sequence).toEqual(0);
    expect(attest.signers[0].block).toEqual(testData2.block);
    expect(attest.signers[0].data).toEqual('Some short test data');
  });
});
