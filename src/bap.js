import fetch from 'node-fetch';
import es from 'event-stream';
import {
  DEBUG,
  AIP_BITCOM_ADDRESS,
  BAP_BITCOM_ADDRESS,
  TOKEN,
} from './config';
import { BAP } from './schemas/bap';
import { Errors } from './schemas/errors';
import { getBitbusBlockEvents } from './get';
import { validAIPSignature } from './aip';
import { getStatusValue, updateStatusValue } from './status';

export const FIRST_BAP_BLOCK = 590000;

export const getBitsocketQuery = function (lastBlockIndexed = false, queryFind = false) {
  queryFind = queryFind || {
    $or: [
      {
        'out.s1': BAP_BITCOM_ADDRESS,
      },
      {
        'out.s2': BAP_BITCOM_ADDRESS,
      },
    ],
  };

  const query = {
    q: {
      find: queryFind,
      sort: {
        'blk.i': 1,
      },
      project: {
        blk: 1,
        'tx.h': 1,
        out: 1,
      },
    },
  };

  if (lastBlockIndexed) {
    query.q.find['blk.i'] = {
      $gt: lastBlockIndexed,
    };
  }

  return query;
};

export const updateLastBlock = async function (block) {
  return updateStatusValue('lastBlock', block);
};

export const getLastBlockIndex = async function () {
  const lastBlockIndex = await getStatusValue('lastBlock');
  return lastBlockIndex ? Number(lastBlockIndex) : FIRST_BAP_BLOCK;
};

export const addBAPErrorTransaction = async function (bapOp) {
  return Errors.updateOne({
    _id: bapOp.txId,
  }, {
    $set: bapOp,
  }, {
    upsert: true,
  });
};

/**
 * Get clean op_return from the bitbus output
 */
export const parseOpReturn = function (op) {
  const { len } = op;
  const opReturn = [];

  /* eslint-disable no-plusplus */
  for (let i = 0; i < len; i++) {
    // :-( this is disgusting - must do better
    if (op[`s${i - 3}`] === AIP_BITCOM_ADDRESS) {
      opReturn.push(op[`b${i}`]);
    } else {
      opReturn.push(op[`s${i}`] || op[`o${i}`] || op[`h${i}`] || op[`b${i}`]);
    }
  }

  if (opReturn[0] === 'OP_0') {
    opReturn.shift();
  }
  opReturn.shift(); // remove the OP_RETURN command

  const opReturnGroups = {
    [opReturn[0]]: [],
  };
  let group = opReturn[0]; // first bitcom address - should be BAP
  /* eslint-disable no-plusplus */
  for (let i = 0; i < opReturn.length; i++) {
    if (opReturn[i] === '|') {
      group = opReturn[i + 1];
      if (group === BAP_BITCOM_ADDRESS) {
        // second BAP op_return, should only be DATA, otherwise invalid
        if (opReturn[i + 2] === 'DATA') {
          // check whether the hashes match
          if (opReturn[i + 3] === opReturnGroups[BAP_BITCOM_ADDRESS][2]) {
            opReturnGroups[BAP_BITCOM_ADDRESS].push(opReturn[i + 4]);
          }
        }
        i += 4;
      } else {
        opReturnGroups[group] = [];
      }
    } else {
      opReturnGroups[group].push(opReturn[i]);
    }
  }

  return opReturnGroups;
};

export const processBapTransaction = async function (bapTransaction) {
  if (!bapTransaction) return;

  const bapQuery = { _id: bapTransaction.txId, ...bapTransaction };
  delete bapQuery.txId;
  bapQuery.processed = false;

  await BAP.updateOne({
    _id: bapQuery._id,
  }, {
    $set: bapQuery,
  }, {
    upsert: true,
  })
    .catch((e) => {
      console.error(e);
    });
};

/**
 * Naive and quick and dirty parser for BAP transactions
 *
 * This should be improved and put into a generic BOB parser, like https://github.com/BitcoinSchema/go-bob
 * Example:
 *  {
      op: {
        i: 0,
        e: { v: 0, i: 0, a: 'false' },
        len: 11,
        o0: 'OP_0',
        o1: 'OP_RETURN',
        s2: '1BAPSuaPnfGnSBM3GLV9yhxUdYe4vGbdMT',
        b2: 'MUJBUFN1YVBuZkduU0JNM0dMVjl5aHhVZFllNHZHYmRNVA==',
        h2: '31424150537561506e66476e53424d33474c56397968785564596534764762644d54',
        s3: 'ATTEST',
        b3: 'QVRURVNU',
        h3: '415454455354',
        s4: 'b26bb30516fb447ba75ffca3c61f9d353fdb57e100bd49a201701132c2742fd6',
        b4: 'YjI2YmIzMDUxNmZiNDQ3YmE3NWZmY2EzYzYxZjlkMzUzZmRiNTdlMTAwYmQ0OWEyMDE3MDExMzJjMjc0MmZkNg==',
        h4: '62323662623330353136666234343762613735666663613363363166396433353366646235376531303062643439613230313730313133326332373432666436',
        s5: '0',
        b5: 'MA==',
        h5: '30',
        s6: '|',
        b6: 'fA==',
        h6: '7c',
        s7: '15PciHG22SNLQJXMoSUaWVi7WSqc7hCfva',
        b7: 'MTVQY2lIRzIyU05MUUpYTW9TVWFXVmk3V1NxYzdoQ2Z2YQ==',
        h7: '313550636948473232534e4c514a584d6f5355615756693757537163376843667661',
        s8: 'BITCOIN_ECDSA',
        b8: 'QklUQ09JTl9FQ0RTQQ==',
        h8: '424954434f494e5f4543445341',
        s9: '134a6TXxzgQ9Az3w8BcvgdZyA5UqRL89da',
        b9: 'MTM0YTZUWHh6Z1E5QXozdzhCY3ZnZFp5QTVVcVJMODlkYQ==',
        h9: '31333461365458787a675139417a33773842637667645a7941355571524c38396461',
        s10: '\u001f)��\\�E�t�\b�+\u0013�n1�j���W\u000e�3���\u0007�)M�C�m��\u0005\u0014�\u001a\fݼ���s\u001cG`\u0007YtW��lQ*�',
        b10: 'HymivVy7RZ105gjtKxPwf25/MdRqwbT9Vw6QM+27tgenKU24Q/Bts70FFMIaDN28/4GgcxxHYAdZdFeunGxRKuE=',
        h10: '1f29a2bd5cbb459d74e608ed2b13f07f6e7f31d46ac1b4fd570e9033edbbb607a7294db843f06db3bd0514c21a0cddbcff81a0731c476007597457ae9c6c512ae1'
      }
    }
 *
 * @param op
 */
export const parseBAPTransaction = function (op) {
  const opReturn = parseOpReturn(op);

  if (
    !opReturn
    || !opReturn[BAP_BITCOM_ADDRESS]
    || opReturn[BAP_BITCOM_ADDRESS][0] !== BAP_BITCOM_ADDRESS
    || !opReturn[BAP_BITCOM_ADDRESS][1]
    || !opReturn[BAP_BITCOM_ADDRESS][2]
    || !opReturn[BAP_BITCOM_ADDRESS][3]
  ) {
    return false;
  }

  const valid = validAIPSignature(opReturn);
  if (!valid) {
    return false;
  }

  const bapTransaction = {
    type: opReturn[BAP_BITCOM_ADDRESS][1],
    hash: opReturn[BAP_BITCOM_ADDRESS][2],
    sequence: opReturn[BAP_BITCOM_ADDRESS][3],
    signatureAddress: opReturn[AIP_BITCOM_ADDRESS][2],
  };

  if (opReturn[BAP_BITCOM_ADDRESS][4]) {
    // data included
    /* eslint-disable prefer-destructuring */
    bapTransaction.data = opReturn[BAP_BITCOM_ADDRESS][4];
  }

  return bapTransaction;
};

export const processBlockEvents = async function (event) {
  const txId = event.tx.h;
  const block = event.blk && event.blk.i;
  const timestamp = (event.blk && event.blk.t) || Math.round(+new Date() / 1000);
  if (event.out) {
    /* eslint-disable no-restricted-syntax */
    for (const op of event.out) {
      if (op.s1 === BAP_BITCOM_ADDRESS || op.s2 === BAP_BITCOM_ADDRESS) {
        try {
          console.log('got BAP transaction', txId, block || 'mempool');
          const bapOp = parseBAPTransaction(op);
          if (bapOp) {
            bapOp.txId = txId;
            bapOp.block = block;
            bapOp.timestamp = timestamp;

            /* eslint-disable no-await-in-loop */
            await processBapTransaction(bapOp);
            if (bapOp.block) {
              await updateLastBlock(bapOp.block);
            }
          } else {
            op.txId = txId;
            op.block = block;
            await addBAPErrorTransaction(op);
          }
        } catch (e) {
          op.txId = txId;
          op.block = block;
          op.error = JSON.stringify(e, Object.getOwnPropertyNames(e));
          await addBAPErrorTransaction(op);
        }
      }
    }
  }
};

export const indexBAPTransactions = async function (queryFind) {
  const lastBlockIndexed = await getLastBlockIndex();
  const query = getBitsocketQuery(lastBlockIndexed, queryFind);

  const data = await getBitbusBlockEvents(query);

  // We must first do all the ID transactions, the attestations rely on them
  data.sort((a, b) => {
    const aOut = a.out.find((ao) => {
      return ao.s1 === '1BAPSuaPnfGnSBM3GLV9yhxUdYe4vGbdMT'
        || ao.s2 === '1BAPSuaPnfGnSBM3GLV9yhxUdYe4vGbdMT';
    });
    const bOut = b.out.find((bo) => {
      return bo.s1 === '1BAPSuaPnfGnSBM3GLV9yhxUdYe4vGbdMT'
        || bo.s2 === '1BAPSuaPnfGnSBM3GLV9yhxUdYe4vGbdMT';
    });

    const cmdA = aOut.o0 === 'OP_RETURN' ? aOut.s2 : aOut.s3;
    const cmdB = bOut.o0 === 'OP_RETURN' ? bOut.s2 : bOut.s3;

    let sort = 0;
    if (cmdA === cmdB) {
      if (a.blk.i === b.blk.i) {
        sort = 0;
      } else {
        sort = a.blk.i > b.blk.i ? 1 : -1;
      }
    } else if (cmdA === 'ID') {
      sort = -1;
    } else if (cmdB === 'ID') {
      sort = 1;
    }

    return sort;
  });

  for (let i = 0; i < data.length; i++) {
    await processBlockEvents(data[i]);
  }

  return true;
};

export const indexBAPTransactionsStream = async function (queryFind = false) {
  const lastBlockIndexed = await getLastBlockIndex();

  if (DEBUG) console.log('POST https://txo.bitbus.network/block');
  const response = await fetch('https://txo.bitbus.network/block', {
    method: 'post',
    headers: {
      'Content-type': 'application/json; charset=utf-8',
      token: TOKEN,
      from: FIRST_BAP_BLOCK,
    },
    body: JSON.stringify(getBitsocketQuery(lastBlockIndexed, queryFind)),
  });

  return new Promise((resolve, reject) => {
    if (DEBUG) console.log('PROCESSING BODY');
    response.body.on('sfinish', () => {
      if (DEBUG) console.log('FINISHED BODY');
      resolve();
    });
    response.body.on('end', () => {
      if (DEBUG) console.log('END BODY');
      resolve();
    });
    response.body.on('error', (e) => {
      if (DEBUG) console.error(e);
      reject(e);
    });
    response.body
      .pipe(es.split(), { end: false })
      .pipe(es.mapSync(async (data) => {
        if (data) {
          const event = JSON.parse(data);
          await processBlockEvents(event);
        }
      }), { end: false });
  });
};
