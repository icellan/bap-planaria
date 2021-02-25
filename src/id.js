import bsv from 'bsv';
import { ID } from './schemas/id';

export const getIdForAddress = async function (address) {
  return ID.findOne({
    'addresses.address': address,
  });
};

export const getIdKeyForAddress = async function (address) {
  const id = await getIdForAddress(address);

  return id ? id._id : null;
};

export const wasIdValidForAddressAt = async function (address, block, id) {
  id = id || await getIdForAddress(address) || { addresses: [] };

  if (block) {
    const signingAddress = id.addresses.find((a) => {
      return a.address === address;
    });

    const nextSigningAddress = id.addresses.find((a) => {
      return a.block > signingAddress.block;
    });

    const validAtBlock = signingAddress
      && signingAddress.block <= block
      && (
        !nextSigningAddress
        || nextSigningAddress.block > block
      );

    const firstSeenOK = !block || block >= id.firstSeen;

    return firstSeenOK && !!signingAddress && validAtBlock;
  }

  // we accept mempool transactions with the current address only
  return address === id.currentAddress;
};

/**
 * Alias transactions will update the identity field of the id
 *
 * @param doc
 * @returns {Promise<void>}
 */
export const handleAliasTransaction = async function (doc) {
  if (doc.type !== 'ALIAS') return;

  const idKey = doc.hash;
  const identity = doc.sequence;
  const identityTxId = doc._id;
  const id = await ID.findOne({ _id: idKey });
  const validAddress = await wasIdValidForAddressAt(doc.signatureAddress, doc.block, id);
  if (id && validAddress) {
    await ID.updateOne({
      _id: idKey,
    }, {
      $set: {
        identity,
        identityTxId,
      },
    });
  }
};

export const handleIDTransaction = async function (doc) {
  if (doc.type !== 'ID') return;

  const idKey = doc.hash;

  const existing = await ID.findOne({ _id: idKey });
  if (existing) {
    // we must first check whether this transaction has already been added to 'addresses'
    const txAlreadyInIds = existing.addresses.find((address) => {
      return address.txId === doc._id;
    });
    if (txAlreadyInIds) {
      // we will only update the block here, otherwise something strange is going on
      if (doc.block) {
        await ID.updateOne({
          _id: doc.hash,
          'addresses.txId': doc._id,
        }, {
          $set: {
            'addresses.$.block': doc.block,
          },
        });
      }

      // If the ID is new and now only being mined, than we also need to set firstSeen
      if (!existing.firstSeen && existing.addresses[0].txId === doc._id) {
        await ID.updateOne({
          _id: doc.hash,
        }, {
          $set: {
            firstSeen: doc.block,
          },
        });
      }
    } else {
      // we must check here whether the new ID transaction was signed by the previous one
      const lastAddress = existing.addresses[existing.addresses.length - 1];
      if (lastAddress.address === doc.signatureAddress) {
        await ID.updateOne({
          _id: doc.hash,
        }, {
          $set: {
            currentAddress: doc.sequence,
          },
          $addToSet: {
            addresses: {
              address: doc.sequence,
              txId: doc._id,
              block: doc.block,
            },
          },
        });
      }
    }
  } else {
    // new ID - the idKey (hash) should be a hash of the rootAddress !!!
    // but only from block 675400
    // turned off for now
    const useIdChecking = false;
    if (useIdChecking && (!doc.block || doc.block > 675400)) {
      const idKeyShouldBe = bsv.encoding.Base58(
        bsv.crypto.Hash.ripemd160(
          Buffer.from(doc.signatureAddress),
        ),
      ).toString();
      if (idKeyShouldBe !== doc.hash) {
        throw new Error('Id key does not match root address');
      }
    }

    await ID.insert({
      _id: doc.hash,
      firstSeen: doc.block,
      rootAddress: doc.signatureAddress,
      currentAddress: doc.sequence,
      addresses: [{
        address: doc.sequence,
        txId: doc._id,
        block: doc.block,
      }],
    });
  }
};
