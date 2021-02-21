/**
 * This is a helpers to find the correct index in the txo data, older data did not have an
 * OP_FALSE OP_RETURN, so will have a different index order
 *
 * @param d
 * @returns {{idKey: *, previousAddress: *, cmd: *, newAddress: *}}
 */
const getCommandData = function (d) {
  const out = d.out.find((ao) => {
    return ao.s1 === '1BAPSuaPnfGnSBM3GLV9yhxUdYe4vGbdMT'
      || ao.s2 === '1BAPSuaPnfGnSBM3GLV9yhxUdYe4vGbdMT';
  });

  const cmd = out.o0 === 'OP_RETURN' ? out.s2 : out.s3;
  const idKey = out.o0 === 'OP_RETURN' ? out.s3 : out.s4;
  const newAddress = out.o0 === 'OP_RETURN' ? out.s4 : out.s5;
  const previousAddress = out.o0 === 'OP_RETURN' ? out.s8 : out.s9;

  return {
    cmd,
    idKey,
    newAddress,
    previousAddress,
  };
};

/**
 * We need to make sure the ids are sorted in the correct order, where a new address is always
 * referencing the previous id. If someone updates lots of IDs at the same time (in the same block)
 * the order will not be guaranteed and bad things can happen
 *
 * @param groupedIds
 */
const sortIds = function (groupedIds) {
  const idKeys = Object.keys(groupedIds);

  const sortedIds = [];
  idKeys.forEach((idKey) => {
    const ids = groupedIds[idKey];
    if (ids.length === 1) {
      // just 1 id for this idKey, just add it to the list
      sortedIds.push(ids[0]);
    } else {
      // create a mapping for newAddress -> previousAddress and the index
      const mappings = [];
      for (let i = 0; i < ids.length; i++) {
        const {
          newAddress,
          previousAddress,
        } = getCommandData(ids[i]);
        mappings.push({
          newAddress,
          previousAddress,
          i,
        });
      }

      // check what links to what, previousAddress <- newAddress
      for (let i = 0; i < mappings.length; i++) {
        const linksTo = mappings.find((m) => {
          return mappings[i].previousAddress === m.newAddress;
        });
        mappings[i].linksTo = linksTo ? linksTo.i : -1;
      }

      // sort the mappings based on the parent linksTo
      mappings.sort((a, b) => {
        if (a.linksTo === b.linksTo) {
          return 0;
        }

        return a.linksTo > b.linksTo ? 1 : -1;
      });

      // populate the sortedIds array with the sorted mappings array
      mappings.forEach((map) => {
        sortedIds.push(ids[map.i]);
      });
    }
  });

  return sortedIds;
};

/**
 * We need to sort the BAP transactions before processing
 * ID transactions need to be done first, otherwise we cannot verify the ATTEST transactions
 *
 * @param data
 * @returns {*[]}
 */
export const sortTransactionsForProcessing = function (data) {
  const ids = {};
  const rest = [];
  data.forEach((d) => {
    const {
      cmd,
      idKey,
    } = getCommandData(d);

    if (cmd === 'ID') {
      if (!ids[idKey]) {
        ids[idKey] = [];
      }
      ids[idKey].push(d);
    } else {
      rest.push(d);
    }
  });

  const sortedIds = sortIds(ids);

  return [...sortedIds, ...rest];
};
