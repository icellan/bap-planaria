import { beforeEach, describe, expect, test } from '@jest/globals';
import { Attest } from '../src/schemas/attest';
import { ID } from '../src/schemas/id';
import { testAttest } from './attest.test';
import { handleDataTransaction } from '../src/attest';
import ids from './data/ids.json';

const dataTestData = {
  _id: '5ced94388fc51b07d909329b4c69c8304ffdc829c4ac9a7bd18bf6477aff567a',
  block: 647493,
  hash: '01a7f66949cf77788d3ce84f08d941d321c24e7d07ffa6dcb8d0e0b7a1d05922',
  sequence: 'This is some test data',
  signatureAddress: '134a6TXxzgQ9Az3w8BcvgdZyA5UqRL89da',
  type: 'DATA',
  timestamp: 1610146262341,
};

describe('handleRevokeTransaction', () => {
  beforeEach(async () => {
    await Attest.deleteMany({});
    await ID.deleteMany({});
    await ID.insert(ids[0]);
  });

  test('simple data', async () => {
    const { attest } = await testAttest();
    await handleDataTransaction(dataTestData);
    const newAttest = await Attest.findOne({_id: attest._id})
    expect(newAttest.signers[0].data).toEqual('This is some test data');
  });

  test('incorrect data', async () => {
    const { attest } = await testAttest();
    const useTestData = JSON.parse(JSON.stringify(dataTestData));
    useTestData.signatureAddress = '1AvzFCsUMM1t5DWxXYGvFxc3SvnLbgt1xb';

    await handleDataTransaction(useTestData);
    const newAttest = await Attest.findOne({_id: attest._id})
    expect(newAttest.signers[0].data).toEqual(undefined);
  });
});
