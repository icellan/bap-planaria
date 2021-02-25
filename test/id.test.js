import { describe, expect, beforeEach, afterEach, test, } from '@jest/globals';
import { ID } from '../src/schemas/id';
import {
  wasIdValidForAddressAt,
  handleIDTransaction,
  handleAliasTransaction,
  getIdForAddress,
  getIdKeyForAddress,
} from '../src/id';

import ids from './data/ids.json';

const testData = {
  _id: '9f6184f28eaced1ebc03bc64fbd08ba37022957c832a7d60a6c821a0b3cfd268',
  hash: 'a3a4efc0c9f528b7f8038bf5f6fc3d71a55796bcf5ce6aa00630af17ae009c00',
  sequence: '1HjLMM9gCLHTjyx8hUW8hof3EauWyGfe9X',
  signatureAddress: '1989KoCzcttiKDzCkERNyN6V3UnNZgSmwo',
  timestamp: 1610146264049,
  type: 'ID',
};

const testInsertId = async function (includeBlock = true) {
  const useTestData = Object.assign({}, testData);
  if (includeBlock) {
    useTestData.block = 647493;
  } else {
    // since this is a mempool transaction, we need to fake the proper idKey which is
    // a hash of the root address - this changed from block 672857
    useTestData.hash = "d5b4ee092ad00bca01917268d19609e11d7062d6c154c9f207996df54bc8cc96";
  }
  await handleIDTransaction(useTestData);

  const id = await ID.findOne({
    _id: useTestData.hash,
  });

  if (includeBlock) {
    expect(id.firstSeen).toEqual(647493);
  } else {
    expect(id.firstSeen).toEqual(undefined);
  }
  expect(id.rootAddress).toEqual('1989KoCzcttiKDzCkERNyN6V3UnNZgSmwo');
  expect(id.currentAddress).toEqual('1HjLMM9gCLHTjyx8hUW8hof3EauWyGfe9X');
  expect(id.addresses.length).toEqual(1);
  expect(id.addresses[0].address).toEqual('1HjLMM9gCLHTjyx8hUW8hof3EauWyGfe9X');
  expect(id.addresses[0].txId).toEqual('9f6184f28eaced1ebc03bc64fbd08ba37022957c832a7d60a6c821a0b3cfd268');
  if (includeBlock) {
    expect(id.addresses[0].block).toEqual(647493);
  } else {
    expect(id.addresses[0].block).toEqual(undefined);
  }
};

describe('handleIDTransaction', () => {
  beforeEach(async () => {
    await ID.deleteMany({});
  });

  test('simple insert', async () => {
    await testInsertId();
  });

  test('getIdForAddress', async() => {
    await testInsertId();
    const id = await getIdForAddress(testData.sequence);
    expect(id._id).toEqual(testData.hash);
  });

  test('getIdKeyForAddress', async() => {
    await testInsertId();
    const idKey = await getIdKeyForAddress(testData.sequence);
    expect(idKey).toEqual(testData.hash);
  });

  test('update block', async () => {
    await testInsertId(false);

    const newTestData = Object.assign({}, testData);
    newTestData.block = 123123;
    await handleIDTransaction(newTestData);
    const id = await ID.findOne({
      _id: newTestData.hash,
    });
    expect(id.firstSeen).toEqual(123123);
    expect(id.addresses[0].block).toEqual(123123);
  });

  test('new id key constraint after block 672857', async () => {
    const newTestData = Object.assign({}, testData);
    newTestData.block = 672858;

    /* Turned off for now
    await expect(handleIDTransaction(newTestData))
      .rejects
      .toThrow('Id key does not match root address');
     */

    newTestData.hash = "d5b4ee092ad00bca01917268d19609e11d7062d6c154c9f207996df54bc8cc96";
    newTestData.block = 672858;
    await handleIDTransaction(newTestData);
    const id = await ID.findOne({
      _id: newTestData.hash,
    });
    expect(id.firstSeen).toEqual(672858);
    expect(id.addresses[0].block).toEqual(672858);
  });

  test('update signing key', async () => {
    await testInsertId();

    await handleIDTransaction({
      _id: '41863901ae2e5fbf496937e082c78a00971a9906c8b4678e7da4cb846e373629',
      block: 647494,
      hash: 'a3a4efc0c9f528b7f8038bf5f6fc3d71a55796bcf5ce6aa00630af17ae009c00',
      sequence: '1HUnHr7JdgktbZZ4k7LZN4uW43nkrzAECQ',
      signatureAddress: '1HjLMM9gCLHTjyx8hUW8hof3EauWyGfe9X',
      timestamp: 1610146264050,
      type: 'ID',
    });

    const id = await ID.findOne({
      _id: 'a3a4efc0c9f528b7f8038bf5f6fc3d71a55796bcf5ce6aa00630af17ae009c00'
    });
    expect(id.firstSeen).toEqual(647493);
    expect(id.rootAddress).toEqual('1989KoCzcttiKDzCkERNyN6V3UnNZgSmwo');
    expect(id.currentAddress).toEqual('1HUnHr7JdgktbZZ4k7LZN4uW43nkrzAECQ');
    expect(id.addresses.length).toEqual(2);
    // should not change the first
    expect(id.addresses[0].address).toEqual('1HjLMM9gCLHTjyx8hUW8hof3EauWyGfe9X');
    expect(id.addresses[0].txId).toEqual('9f6184f28eaced1ebc03bc64fbd08ba37022957c832a7d60a6c821a0b3cfd268');
    expect(id.addresses[0].block).toEqual(647493);
    // should add new signing address
    expect(id.addresses[1].address).toEqual('1HUnHr7JdgktbZZ4k7LZN4uW43nkrzAECQ');
    expect(id.addresses[1].txId).toEqual('41863901ae2e5fbf496937e082c78a00971a9906c8b4678e7da4cb846e373629');
    expect(id.addresses[1].block).toEqual(647494);
  });

  test('failed update signing key', async () => {
    await testInsertId();

    await handleIDTransaction({
      _id: '41863901ae2e5fbf496937e082c78a00971a9906c8b4678e7da4cb846e373629',
      block: 647495,
      hash: 'a3a4efc0c9f528b7f8038bf5f6fc3d71a55796bcf5ce6aa00630af17ae009c00',
      sequence: '1HUnHr7JdgktbZZ4k7LZN4uW43nkrzAECQ',
      signatureAddress: '1jQUModfGhwQiTM9WCSzeHVozASWSqg7u', // incorrect signature
      timestamp: 1610146264051,
      type: 'ID',
    });

    const id = await ID.findOne({
      _id: 'a3a4efc0c9f528b7f8038bf5f6fc3d71a55796bcf5ce6aa00630af17ae009c00'
    });
    expect(id.firstSeen).toEqual(647493);
    expect(id.rootAddress).toEqual('1989KoCzcttiKDzCkERNyN6V3UnNZgSmwo');
    expect(id.currentAddress).toEqual('1HjLMM9gCLHTjyx8hUW8hof3EauWyGfe9X');
    expect(id.addresses.length).toEqual(1);
  });
});

const testIdentity = async function () {
  const identity = '{@company alias data}';
  const txId = '5e305844b59b516b35b18188307a8235d440d9fed1346ae725b61cb6ab2699c1';
  await handleAliasTransaction({
    _id: txId,
    hash: testData.hash,
    sequence: identity,
    signatureAddress: testData.sequence,
    type: 'ALIAS',
    timestamp: 1610146264123,
  });
  const id = await ID.findOne({
    _id: testData.hash,
  });
  expect(id.identity).toEqual(identity);
  expect(id.identityTxId).toEqual(txId);
};

describe('handleAliasTransaction', () => {
  beforeEach(async () => {
    await ID.deleteMany({});
  });

  test('simple update', async () => {
    await testInsertId();
    await testIdentity();
  });

  test('no update', async () => {
    await testInsertId();

    const identity = '{@company alias data}';
    await handleAliasTransaction({
      _id: 'e16a719bee0d7fb6856cf78ac1fdb2bda0bc5bcda53e073db13bc3733f9d17b2',
      hash: testData.hash,
      sequence: identity,
      signatureAddress: testData.signatureAddress, // incorrect signing address
      type: 'ALIAS',
      timestamp: 1610146264123,
    });
    const id = await ID.findOne({
      _id: testData.hash
    });
    expect(id.identity).toEqual(undefined);
    expect(id.identityTxId).toEqual(undefined);
  });

  test('no update when already set', async () => {
    await testInsertId();
    await testIdentity();

    const identity = '{@company alias data on new transaction}';
    await handleAliasTransaction({
      _id: 'e16a719bee0d7fb6856cf78ac1fdb2bda0bc5bcda53e073db13bc3733f9d17b2',
      hash: testData.hash,
      sequence: identity,
      signatureAddress: testData.signatureAddress, // incorrect signing address
      type: 'ALIAS',
      timestamp: 1610146264123,
    });
    const id = await ID.findOne({
      _id: testData.hash
    });
    // old values stay
    expect(id.identity).toEqual('{@company alias data}');
    expect(id.identityTxId).toEqual('5e305844b59b516b35b18188307a8235d440d9fed1346ae725b61cb6ab2699c1');
  });
});

describe('wasIdValidForAddressAt', () => {
  beforeEach(async () => {
    await ID.deleteMany({});
  });

  test('simple valid', async () => {
    await ID.insert(ids[0]);
    const valid = await wasIdValidForAddressAt(ids[0].addresses[0].address, 590195);
    expect(valid).toEqual(true);
  });

  test('simple valid same block', async () => {
    await ID.insert(ids[0]);
    const valid = await wasIdValidForAddressAt(ids[0].addresses[0].address, 590194);
    expect(valid).toEqual(true);
  });

  test('simple invalid', async () => {
    await ID.insert(ids[0]);
    const valid = await wasIdValidForAddressAt(ids[0].addresses[0].address, 590192);
    expect(valid).toEqual(false);
  });

  test('valid multiple addresses', async () => {
    await ID.insert(ids[0]);

    const newAddress = '1Muvi5ccfug16tWzrzdUMPCTkxTowT6zNM';
    await ID.updateOne({
      _id: ids[0]._id
    },{
      $addToSet: {
        addresses: {
          address: newAddress,
          txId: 'c01e0f2df94603e04e90d35e446e6608926259aedd9cb9de6f9b5048863a277d',
          block: 599655
        }
      }
    });
    const id = await ID.findOne();

    const valid = await wasIdValidForAddressAt(ids[0].addresses[0].address, 599654, id);
    expect(valid).toEqual(true);
    const valid2 = await wasIdValidForAddressAt(ids[0].addresses[0].address, 599655, id);
    expect(valid2).toEqual(false);

    const valid3 = await wasIdValidForAddressAt(newAddress, 599654, id);
    expect(valid3).toEqual(false);
    const valid4 = await wasIdValidForAddressAt(newAddress, 599655, id);
    expect(valid4).toEqual(true);
    const valid5 = await wasIdValidForAddressAt(newAddress, 599656, id);
    expect(valid5).toEqual(true);
  });
});
