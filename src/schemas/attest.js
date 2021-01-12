import SimpleSchema from 'simpl-schema';
import { Collection } from '../lib/collection';

const signersSchema = new SimpleSchema({
  idKey: {
    type: String,
    label: 'Id key of the signer',
    optional: false,
  },
  address: {
    type: String,
    label: 'Bitcoin address of the private key used to sign',
    optional: false,
  },
  txId: {
    type: String,
    label: 'The transaction ID for this attestation',
    optional: false,
  },
  block: {
    type: SimpleSchema.Integer,
    label: 'The block this attestation was mined, if applicable, otherwise still in mempool',
    optional: true,
  },
  sequence: {
    type: SimpleSchema.Integer,
    label: 'The sequence number for the attestation',
    optional: true,
  },
  revokedId: {
    type: String,
    label: 'Transaction ID of the REVOKE transaction for this attestation',
    optional: true,
  },
  data: {
    type: String,
    label: 'Data added to this attestation by the attester',
    optional: true,
  },
});

export const Attest = new Collection('attest', new SimpleSchema({
  hash: {
    type: String,
    label: 'Hash of the attestation',
    optional: true,
  },
  signers: {
    type: Array,
    label: 'The addresses that sign for this attestation',
    optional: false,
  },
  'signers.$': {
    type: signersSchema,
  },
}));
