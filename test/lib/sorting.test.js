import { describe, expect, beforeEach, afterEach, test, } from '@jest/globals';
import { sortTransactionsForProcessing } from '../../src/lib/sorting';

import ids from '../data/ids-full.json';

const idsExpected = [
  "1FKMLgnnyRhmJxrdpR5cjMGhbgUdHbmjdS",
  "1EuR2t8ZNAogBiQu9ofCp9YJ2PTM3EmJqp",
  "1CGWTuoyYmGtGVfF7sYcGRiwjWKEpoXm8G",
  "1GdXcMBVpgc232hW3kXGveYo4mxAaqfr87",
  "14UAX3qdzrgThZRxQuswnfYVtnT4Qm18ZQ",
  "13oxJXZNompcU9vsTGKbkTsKqJz6WFjBja",
  "197wYaDJUZaoPrW1CTcWiafNKbhc4bQ41V"
]

describe('sortTransactionsForProcessing', () => {
  test('IDs first', async () => {
    const sortedData = sortTransactionsForProcessing(ids);
    const types = sortedData.map((d) => d.out[0].s3);
    expect(types.length).toEqual(31);
    const typesId = types.splice(0, 15);
    const distinct = [...new Set(typesId)];
    expect(distinct).toStrictEqual(['ID']);
  });

  test('IDs in correct order', async () => {
    const sortedData = sortTransactionsForProcessing(ids);
    const types = sortedData.filter((d) => d.out[0].s3 === 'ID'
      && d.out[0].s4 === 'ce007938819c927a94af9f52524a65a205e9917fd4b099b61dbc869eade43278');
    const idSet = [...new Set([...types.map((d) => d.out[0].s5)])];
    expect(idSet).toStrictEqual(idsExpected);
  });
});
