import { beforeEach, describe, expect, test } from '@jest/globals';
import { Attest } from '../src/schemas/attest';
import { ID } from '../src/schemas/id';
import { testData, testBlock, testAttest } from './attest.test';
import { handleRevokeTransaction } from '../src/attest';
import ids from './data/ids.json';

const revokeTxId = 'c997fc12f6ec2d2f9b0543d4f3ff5807f41566d0097128acbb0e1c72bedb580d';
const testRevoke = async function (sequence) {
  const useTestData = {
    _id: revokeTxId,
    block: testBlock,
    hash: '01a7f66949cf77788d3ce84f08d941d321c24e7d07ffa6dcb8d0e0b7a1d05922',
    sequence: '' + sequence,
    signatureAddress: '134a6TXxzgQ9Az3w8BcvgdZyA5UqRL89da',
    type: 'REVOKE',
    timestamp: 1610146262341,
  };

  await handleRevokeTransaction(useTestData);

  return {
    attest: await Attest.findOne({
      _id: testData.hash,
    }),
    useTestData,
  };
};

describe('handleRevokeTransaction', () => {
  beforeEach(async () => {
    await Attest.deleteMany({});
    await ID.deleteMany({});
    await ID.insert(ids[0]);
  });

  test('simple revoke', async () => {
    await testAttest();
    const { attest, useTestData } = await testRevoke(1);

    expect(attest._id).toEqual(useTestData.hash);
    expect(attest.signers.length).toEqual(1);
    expect(attest.signers[0].idKey).toEqual(ids[0]._id);
    expect(attest.signers[0].address).toEqual(useTestData.signatureAddress);
    expect(attest.signers[0].txId).toEqual(testData._id);
    expect(attest.signers[0].block).toEqual(useTestData.block);
    expect(attest.signers[0].sequence).toEqual(1);
    expect(attest.signers[0].revokedId).toEqual(revokeTxId);
  });

  test('incorrect revoke', async () => {
    await testAttest();
    const { attest, useTestData } = await testRevoke(0);

    expect(attest._id).toEqual(useTestData.hash);
    expect(attest.signers.length).toEqual(1);
    expect(attest.signers[0].idKey).toEqual(ids[0]._id);
    expect(attest.signers[0].address).toEqual(useTestData.signatureAddress);
    expect(attest.signers[0].txId).toEqual(testData._id);
    expect(attest.signers[0].block).toEqual(testBlock);
    expect(attest.signers[0].sequence).toEqual(0);
    expect(attest.signers[0].revokedId).toEqual(undefined);
  });

  test('revoke and re-attest', async () => {
    await testAttest();
    await testRevoke(1);
    const { attest, useTestData } = await testAttest(true, 2);

    expect(attest._id).toEqual(useTestData.hash);
    expect(attest.signers.length).toEqual(1);
    expect(attest.signers[0].idKey).toEqual(ids[0]._id);
    expect(attest.signers[0].address).toEqual(useTestData.signatureAddress);
    expect(attest.signers[0].txId).toEqual(testData._id);
    expect(attest.signers[0].block).toEqual(testBlock);
    expect(attest.signers[0].sequence).toEqual(2);
    expect(attest.signers[0].revokedId).toEqual(undefined);
  });
});
