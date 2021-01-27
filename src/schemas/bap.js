import SimpleSchema from 'simpl-schema';
import { Collection } from '../lib/collection';
import {
  handleAttestationTransaction,
  handleRevokeTransaction,
  handleDataTransaction,
} from '../attest';
import {
  handleIDTransaction,
  handleAliasTransaction,
} from '../id';

export const BAP = new Collection('bap', new SimpleSchema({
  block: {
    type: SimpleSchema.Integer,
    label: 'Block number this transaction was mined into - null if still in mempool',
    optional: true,
  },
  type: {
    type: String,
    label: 'Type of BAP transaction (ID, ATTEST, DATA, ALIAS, ...)',
    optional: false,
  },
  hash: {
    type: String,
    label: 'ID key or attestation hash',
    optional: false,
  },
  sequence: {
    type: String,
    label: 'Sequences number of the attestation, or the address of the ID',
    optional: false,
  },
  signatureAddress: {
    type: String,
    label: 'Bitcoin address this bap transaction was signed with',
    optional: false,
  },
  data: {
    type: String,
    label: 'Optional data that was appended to this BAP transaction',
    optional: true,
  },
  timestamp: {
    type: SimpleSchema.Integer,
    label: 'timestamp the transaction was broadcast - if available',
    optional: true,
  },
  processed: {
    type: Boolean,
  },
}));

// all BAP inserts / updates are done as upserts
// there will only be valid transactions inserted, so here we can assume that for instance
// signing has been verified
BAP.after('updateOne', async (doc, modifier, options) => {
  if (
    options.upsert === true
    && modifier.$set
    && modifier.$set.type
    && modifier.$set.hash
    && modifier.$set.sequence
    && modifier.$set.signatureAddress
  ) {
    const { type } = modifier.$set;
    if (type === 'ATTEST') {
      await handleAttestationTransaction(modifier.$set);
    } else if (type === 'ID') {
      await handleIDTransaction(modifier.$set);
    } else if (type === 'REVOKE') {
      await handleRevokeTransaction(modifier.$set);
    } else if (type === 'ALIAS') {
      await handleAliasTransaction(modifier.$set);
    } else if (type === 'DATA') {
      await handleDataTransaction(modifier.$set);
    }

    await BAP.update({
      _id: doc._id,
    }, {
      $set: {
        processed: true,
      },
    });
  }
});
