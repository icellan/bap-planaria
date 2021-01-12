import SimpleSchema from 'simpl-schema';
import { Collection } from '../lib/collection';

const signingAddressSchema = new SimpleSchema({
  address: {
    type: String,
    label: 'Bitcoin address',
    optional: false,
  },
  txId: {
    type: String,
    label: 'The transaction ID when this address was put into use',
    optional: false,
  },
  block: {
    type: SimpleSchema.Integer,
    label: 'The block this signing address was mined, if applicable, otherwise still in mempool',
    optional: true,
  },
});

export const ID = new Collection('id', new SimpleSchema({
  firstSeen: {
    type: SimpleSchema.Integer,
    label: 'When this ID was first seen on the network',
    optional: true,
  },
  rootAddress: {
    type: String,
    label: 'The root address for this identity that can be used to destroy it',
    optional: false,
  },
  currentAddress: {
    type: String,
    label: 'The current address for this identity',
    optional: false,
  },
  addresses: {
    type: Array,
    label: 'The addresses that can be used to sign for this id',
    optional: false,
  },
  'addresses.$': {
    type: signingAddressSchema,
  },
  identity: {
    type: String,
    label: 'JSON stringified object with identity information',
    optional: true,
  },
  identityTxId: {
    type: String,
    label: 'Transaction ID of the identity information',
    optional: true,
  },
}));
