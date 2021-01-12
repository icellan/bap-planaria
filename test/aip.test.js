import {
  describe,
  expect,
  beforeEach,
  afterEach,
  test,
} from '@jest/globals';

import { parseOpReturn } from '../src/bap';
import { validAIPSignature} from '../src/aip';

import ops from './data/ops.json';

describe('validAIPSignature', () => {
  test('validate ATTEST', () => {
    const parsed = parseOpReturn(ops[0]);
    expect(validAIPSignature(parsed)).toBe(true);
  });

  test('validate ID', () => {
    const parsed = parseOpReturn(ops[1]);
    expect(validAIPSignature(parsed)).toBe(true);
  });

  test('validate with data', () => {
    const parsed = parseOpReturn(ops[2]);
    expect(validAIPSignature(parsed)).toBe(true);
  });

  test('validate incorrect sig', () => {
    const parsed = parseOpReturn(ops[3]);
    expect(validAIPSignature(parsed)).toBe(false);
  });
});
