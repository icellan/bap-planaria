import yargs from 'yargs';
import { hideBin } from 'yargs/yargs';
import { getBitbusBlockEvents } from './get';
import { indexBAPTransactions } from './bap';
import { watchBAPTransactions } from './watch';
import { BAP_BITCOM_ADDRESS } from './config';

const options = yargs(hideBin(process.argv))
  .usage('Usage: -a <action>')
  .option('a', {
    alias: 'action',
    describe: 'Action (run (default), watch, get)',
    type: 'string',
  })
  .option('t', {
    alias: 'txId',
    describe: 'Tx Id to get from bitbus - use together with -g option',
    type: 'string',
  })
  .option('q', {
    alias: 'query',
    describe: 'JSON strinigifed query to get from bitbus - use together with -g option',
    type: 'string',
  })
  .argv;

(async () => {
  if (options.action === 'get') {
    const query = {
      q: {
        find: {
          'out.s2': BAP_BITCOM_ADDRESS,
        },
        sort: {
          'blk.i': 1,
        },
        project: {
          blk: 1,
          'tx.h': 1,
          out: 1,
        },
        limit: 10,
      },
    };
    if (options.txId) {
      query.q.find = { 'tx.h': options.txId };
    } else if (options.query) {
      query.q.find = JSON.parse(options.query);
    } else {
      console.error('Must pass either -t <txID> or -q <query> when using -a get');
      process.exit(-1);
    }
    console.log(query);
    console.log(JSON.stringify(await getBitbusBlockEvents(query)));
    process.exit();
  } else if (options.action === 'watch') {
    console.log('Running continuous watch');
    await watchBAPTransactions();
  } else {
    console.log('Running once');
    await indexBAPTransactions();
    console.log('Done');
    process.exit();
  }
})()
  .catch((error) => {
    console.error(error);
  });
