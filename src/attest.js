import {
  getIdForAddress,
  wasIdValidForAddressAt,
} from './id';
import { Attest } from './schemas/attest';
import { addBAPErrorTransaction } from './bap';

export const handleAttestationTransaction = async function (doc) {
  if (doc.type !== 'ATTEST') return;

  const id = await getIdForAddress(doc.signatureAddress);
  const validAddress = await wasIdValidForAddressAt(doc.signatureAddress, doc.block, id);
  if (id && validAddress) {
    const idKey = id._id;
    const attestation = {
      idKey,
      address: doc.signatureAddress,
      txId: doc._id,
      block: doc.block,
      sequence: Number(doc.sequence),
    };
    if (doc.data) attestation.data = doc.data;

    const existing = await Attest.findOne({ _id: doc.hash });
    if (existing) {
      // we must first check whether this transaction has already been added to 'signers'
      const txAlreadyInAttestation = existing.signers?.find((sign) => {
        return sign.txId === doc.txId;
      });
      if (txAlreadyInAttestation) {
        // we will only update the block here, otherwise something strange is going on
        await Attest.update({
          _id: doc.hash,
          'signers.txId': doc._id,
        }, {
          $set: {
            'signers.$.block': doc.block,
          },
        });
      } else {
        // here we must check whether the idKey has signed before
        const signerAlreadyInAttestation = existing.signers?.find((sign) => {
          return sign.idKey === idKey;
        });
        if (signerAlreadyInAttestation) {
          // this should be a re-attest, since there is already a valid transaction
          await Attest.updateOne({
            _id: doc.hash,
            'signers.idKey': idKey,
            'signers.sequence': {
              $lt: Number(doc.sequence),
            },
          }, {
            $set: {
              'signers.$.sequence': Number(doc.sequence),
            },
            $unset: {
              'signers.$.revokedId': doc._id,
            },
          });
        } else {
          await Attest.update({
            _id: doc.hash,
          }, {
            $addToSet: {
              signers: attestation,
            },
          });
        }
      }
    } else {
      await Attest.insert({
        _id: doc.hash,
        signers: [attestation],
      });
    }
  } else {
    await addBAPErrorTransaction({
      txId: doc._id,
      doc,
      error: 'Could not validate attestation',
      id,
      validAddress,
    });
  }
};

export const handleRevokeTransaction = async function (doc) {
  if (doc.type !== 'REVOKE') return;

  const id = await getIdForAddress(doc.signatureAddress);
  const validAddress = await wasIdValidForAddressAt(doc.signatureAddress, doc.block, id);
  if (id && validAddress) {
    const idKey = id._id;
    const existing = await Attest.findOne({ _id: doc.hash });
    if (existing) {
      // this transaction should already been added to 'signers' - otherwise just ignore
      await Attest.updateOne({
        _id: doc.hash,
        'signers.idKey': idKey,
        'signers.sequence': {
          $lt: Number(doc.sequence),
        },
      }, {
        $set: {
          'signers.$.revokedId': doc._id,
          'signers.$.sequence': Number(doc.sequence),
        },
      });
    }
  }
};

export const handleDataTransaction = async function (doc) {
  if (doc.type !== 'DATA') return;

  const id = await getIdForAddress(doc.signatureAddress);
  const validAddress = await wasIdValidForAddressAt(doc.signatureAddress, doc.block, id);
  if (id && validAddress) {
    const idKey = id._id;
    const existing = await Attest.findOne({ _id: doc.hash });
    if (existing) {
      // this transaction should already been added to 'signers' - otherwise just ignore
      await Attest.updateOne({
        _id: doc.hash,
        'signers.idKey': idKey,
      }, {
        $set: {
          'signers.$.data': doc.sequence,
        },
      });
    }
  }
};
