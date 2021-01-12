import { describe, expect, beforeEach, afterEach, test, } from '@jest/globals';
import { AIP_BITCOM_ADDRESS, BAP_BITCOM_ADDRESS } from '../src/config';
import { BAP } from '../src/schemas/bap';
import { Errors } from '../src/schemas/errors';
import { Status } from '../src/schemas/status';
import { ID } from '../src/schemas/id';
import {
  getBitsocketQuery,
  parseBAPTransaction,
  parseOpReturn,
  processBapTransaction,
  updateLastBlock,
  addBAPErrorTransaction,
} from '../src/bap';

import ops from './data/ops.json';

describe('parseOpReturn', () => {
  test('structure ATTEST', () => {
    const parsedOp = parseOpReturn(ops[0]);
    expect(typeof parsedOp).toBe('object');
    expect(typeof parsedOp[BAP_BITCOM_ADDRESS]).toBe('object');
    expect(parsedOp[BAP_BITCOM_ADDRESS][0]).toBe(BAP_BITCOM_ADDRESS);
    expect(parsedOp[BAP_BITCOM_ADDRESS][1]).toBe('ATTEST');
    expect(parsedOp[BAP_BITCOM_ADDRESS][2]).toBe('721dcc5af14439cbb7dfb278d60994687fe1f4016738a3f10746a980361d4d62');
    expect(parsedOp[BAP_BITCOM_ADDRESS][3]).toBe('0');

    expect(typeof parsedOp[AIP_BITCOM_ADDRESS]).toBe('object');
    expect(parsedOp[AIP_BITCOM_ADDRESS][0]).toBe(AIP_BITCOM_ADDRESS);
    expect(parsedOp[AIP_BITCOM_ADDRESS][1]).toBe('BITCOIN_ECDSA');
    expect(parsedOp[AIP_BITCOM_ADDRESS][2]).toBe('134a6TXxzgQ9Az3w8BcvgdZyA5UqRL89da');
    expect(typeof parsedOp[AIP_BITCOM_ADDRESS][3]).toBe('string');
  });

  test('structure ID', () => {
    const parsedOp = parseOpReturn(ops[1]);
    expect(typeof parsedOp).toBe('object');
    expect(typeof parsedOp[BAP_BITCOM_ADDRESS]).toBe('object');
    expect(parsedOp[BAP_BITCOM_ADDRESS][0]).toBe(BAP_BITCOM_ADDRESS);
    expect(parsedOp[BAP_BITCOM_ADDRESS][1]).toBe('ID');
    expect(parsedOp[BAP_BITCOM_ADDRESS][2]).toBe('c23e352cf4c220cc3da752073e85897bb4a46a90b92a360bc48d78f83f2320f8');
    expect(parsedOp[BAP_BITCOM_ADDRESS][3]).toBe('16sgCjGK5G7rRmUonYTuyxzX9GbHaoXXAN');

    expect(typeof parsedOp[AIP_BITCOM_ADDRESS]).toBe('object');
    expect(parsedOp[AIP_BITCOM_ADDRESS][0]).toBe(AIP_BITCOM_ADDRESS);
    expect(parsedOp[AIP_BITCOM_ADDRESS][1]).toBe('BITCOIN_ECDSA');
    expect(parsedOp[AIP_BITCOM_ADDRESS][2]).toBe('1GEXzDk5dtmz7JVU9BqpqamcMqUcV1yARS');
    expect(typeof parsedOp[AIP_BITCOM_ADDRESS][3]).toBe('string');
  });

  test('structure with DATA', () => {
    const parsedOp = parseOpReturn(ops[2]);
    expect(typeof parsedOp).toBe('object');
    expect(typeof parsedOp[BAP_BITCOM_ADDRESS]).toBe('object');
    expect(parsedOp[BAP_BITCOM_ADDRESS][0]).toBe(BAP_BITCOM_ADDRESS);
    expect(parsedOp[BAP_BITCOM_ADDRESS][1]).toBe('ATTEST');
    expect(parsedOp[BAP_BITCOM_ADDRESS][2]).toBe('721dcc5af14439cbb7dfb278d60994687fe1f4016738a3f10746a980361d4d62');
    expect(parsedOp[BAP_BITCOM_ADDRESS][3]).toBe('0');
    expect(parsedOp[BAP_BITCOM_ADDRESS][4]).toBe('This is just some test data');

    expect(typeof parsedOp[AIP_BITCOM_ADDRESS]).toBe('object');
    expect(parsedOp[AIP_BITCOM_ADDRESS][0]).toBe(AIP_BITCOM_ADDRESS);
    expect(parsedOp[AIP_BITCOM_ADDRESS][1]).toBe('BITCOIN_ECDSA');
    expect(parsedOp[AIP_BITCOM_ADDRESS][2]).toBe('1M9d7TusxFULUpWstiYx14gWjA4MnnDEuz');
    expect(typeof parsedOp[AIP_BITCOM_ADDRESS][3]).toBe('string');
  });

  test('structure incorrect sig', () => {
    const parsedOp = parseOpReturn(ops[3]);
    expect(typeof parsedOp).toBe('object');
    expect(typeof parsedOp[BAP_BITCOM_ADDRESS]).toBe('object');
    expect(parsedOp[BAP_BITCOM_ADDRESS][0]).toBe(BAP_BITCOM_ADDRESS);
    expect(parsedOp[BAP_BITCOM_ADDRESS][1]).toBe('ID');
    expect(parsedOp[BAP_BITCOM_ADDRESS][2]).toBe('04fd0fa093a51166aa767b7f85e3bd45b44d184ab2c505c1aa2001550f345cb765');
    expect(parsedOp[BAP_BITCOM_ADDRESS][3]).toBe('17MgeFus55sXg8zSLeWAViZMBE5RWndRRR');

    expect(typeof parsedOp[AIP_BITCOM_ADDRESS]).toBe('object');
    expect(parsedOp[AIP_BITCOM_ADDRESS][0]).toBe(AIP_BITCOM_ADDRESS);
    expect(parsedOp[AIP_BITCOM_ADDRESS][1]).toBe('BITCOIN_ECDSA');
    expect(parsedOp[AIP_BITCOM_ADDRESS][2]).toBe('1D8MXFaW4F2zbM1trgjmbUaMvyMsUqL2V9');
    expect(typeof parsedOp[AIP_BITCOM_ADDRESS][3]).toBe('string');
  });
});

describe('getBitsocketQuery', () => {
  test('lastBlockIndexed', () => {
    const query = getBitsocketQuery(123123);
    expect(typeof query).toBe('object');
    expect(query.q.find['blk.i'].$gt).toBe(123123);
  });
});

describe('parseBAPTransaction', () => {
  test('parse ATTEST', () => {
    const parsed = parseBAPTransaction(ops[0]);
    expect(typeof parsed).toBe('object');
    expect(parsed.type).toBe('ATTEST');
    expect(parsed.hash).toBe('721dcc5af14439cbb7dfb278d60994687fe1f4016738a3f10746a980361d4d62');
    expect(parsed.sequence).toBe('0');
    expect(parsed.signatureAddress).toBe('134a6TXxzgQ9Az3w8BcvgdZyA5UqRL89da');
  });

  test('parse ID', () => {
    const parsed = parseBAPTransaction(ops[1]);
    expect(typeof parsed).toBe('object');
    expect(parsed.type).toBe('ID');
    expect(parsed.hash).toBe('c23e352cf4c220cc3da752073e85897bb4a46a90b92a360bc48d78f83f2320f8');
    expect(parsed.sequence).toBe('16sgCjGK5G7rRmUonYTuyxzX9GbHaoXXAN');
    expect(parsed.signatureAddress).toBe('1GEXzDk5dtmz7JVU9BqpqamcMqUcV1yARS');
  });

  test('parse with data', () => {
    const parsed = parseBAPTransaction(ops[2]);
    expect(typeof parsed).toBe('object');
    expect(parsed.type).toBe('ATTEST');
    expect(parsed.hash).toBe('721dcc5af14439cbb7dfb278d60994687fe1f4016738a3f10746a980361d4d62');
    expect(parsed.sequence).toBe('0');
    expect(parsed.signatureAddress).toBe('1M9d7TusxFULUpWstiYx14gWjA4MnnDEuz');
    expect(parsed.data).toBe('This is just some test data');
  });

  test('parse with invalid sig', () => {
    const parsed = parseBAPTransaction(ops[3]);
    expect(typeof parsed).toBe('boolean');
    expect(parsed).toBe(false);
  });

  test('parse incorrect ', () => {
    const parsed = parseBAPTransaction({});
    expect(typeof parsed).toBe('boolean');
    expect(parsed).toBe(false);
  });
});

describe('database functions', () => {
  beforeEach(async () => {
    await BAP.deleteMany({});
  });

  test('processBapTransaction', async () => {
    await processBapTransaction({
      txId: 'b2c8139e801da6d3b97d711ea90f67170f9adcbbef3daf4d441bb75f1b2155f4',
      type: 'ID',
      hash: '04fd0fa093a51166aa767b7f85e3bd45b44d184ab2c505c1aa2001550f345cb765',
      sequence: '17MgeFus55sXg8zSLeWAViZMBE5RWndRRR',
      signatureAddress: '1D8MXFaW4F2zbM1trgjmbUaMvyMsUqL2V9',
    });
    const bap = await BAP.findOne({_id: 'b2c8139e801da6d3b97d711ea90f67170f9adcbbef3daf4d441bb75f1b2155f4'});
    expect(bap.txId).toEqual(undefined);
    expect(bap._id).toEqual('b2c8139e801da6d3b97d711ea90f67170f9adcbbef3daf4d441bb75f1b2155f4');
    expect(bap.type).toEqual('ID');
    expect(bap.hash).toEqual('04fd0fa093a51166aa767b7f85e3bd45b44d184ab2c505c1aa2001550f345cb765');
    expect(bap.sequence).toEqual('17MgeFus55sXg8zSLeWAViZMBE5RWndRRR');
    expect(bap.signatureAddress).toEqual('1D8MXFaW4F2zbM1trgjmbUaMvyMsUqL2V9');

    // transaction with some data
    await processBapTransaction({
      txId: 'b2c8139e801da6d3b97d711ea90f67170f9adcbbef3daf4d441bb75f1b2155f4',
      block: 669082,
      type: 'ID',
      hash: '04fd0fa093a51166aa767b7f85e3bd45b44d184ab2c505c1aa2001550f345cb765',
      sequence: '17MgeFus55sXg8zSLeWAViZMBE5RWndRRR',
      signatureAddress: '1D8MXFaW4F2zbM1trgjmbUaMvyMsUqL2V9',
      data: 'Some test data'
    });
    const bap2 = await BAP.findOne({_id: 'b2c8139e801da6d3b97d711ea90f67170f9adcbbef3daf4d441bb75f1b2155f4'});
    expect(bap2.txId).toEqual(undefined);
    expect(bap2._id).toEqual('b2c8139e801da6d3b97d711ea90f67170f9adcbbef3daf4d441bb75f1b2155f4');
    expect(bap2.type).toEqual('ID');
    expect(bap2.hash).toEqual('04fd0fa093a51166aa767b7f85e3bd45b44d184ab2c505c1aa2001550f345cb765');
    expect(bap2.block).toEqual(669082);
    expect(bap2.sequence).toEqual('17MgeFus55sXg8zSLeWAViZMBE5RWndRRR');
    expect(bap2.signatureAddress).toEqual('1D8MXFaW4F2zbM1trgjmbUaMvyMsUqL2V9');
    expect(bap2.data).toEqual('Some test data');

    // update transaction with some new data from a separate transaction
    await processBapTransaction({
      txId: 'dc0c583377137443416e3158ba17d63d14261e776d1152e6c93e044c1ee5f050',
      block: 669082,
      type: 'DATA',
      hash: '04fd0fa093a51166aa767b7f85e3bd45b44d184ab2c505c1aa2001550f345cb765',
      sequence: 'Some test data in a separate transaction',
      signatureAddress: '1D8MXFaW4F2zbM1trgjmbUaMvyMsUqL2V9',
    });
    const bap3 = await BAP.findOne({_id: 'dc0c583377137443416e3158ba17d63d14261e776d1152e6c93e044c1ee5f050'});
    expect(bap3.txId).toEqual(undefined);
    expect(bap3._id).toEqual('dc0c583377137443416e3158ba17d63d14261e776d1152e6c93e044c1ee5f050');
    expect(bap3.type).toEqual('DATA');
    expect(bap3.hash).toEqual('04fd0fa093a51166aa767b7f85e3bd45b44d184ab2c505c1aa2001550f345cb765');
    expect(bap3.sequence).toEqual('Some test data in a separate transaction');
    expect(bap3.signatureAddress).toEqual('1D8MXFaW4F2zbM1trgjmbUaMvyMsUqL2V9');
    expect(bap3.data).toEqual(undefined);
  });

  test('updateLastBlock', async () => {
    await updateLastBlock(123123);
    const status = await Status.findOne({_id: 'lastBlock'});
    expect(status.value).toEqual("123123");

    await updateLastBlock(123124);
    const status2 = await Status.findOne({_id: 'lastBlock'});
    expect(status2.value).toEqual("123124");
  });

  test('addBAPErrorTransaction', async () => {
    await addBAPErrorTransaction({
      txId: '123123123',
      test: 'test',
    });
    const error = await Errors.findOne({_id: '123123123'});
    expect(error.txId).toEqual('123123123');
    expect(error.test).toEqual('test');
  });
});
