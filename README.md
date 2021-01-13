# bap-planaria
> BAP transaction indexer

BAP-planaria is a [Bitbus](https://docs.bitbus.network/) compatible Bitcoin Attestation Protocol indexer. It scans all BAP transactions and processes them into a global BAP state using the bitsocket.network servers.

**NOTE:** This is still work in progress and should be considered beta software. Issues / requests and PR's are welcome.

# global installation

```shell
npm install -g bap-planaria
```

Set the environment variables. You must at least set the planaria token.

```shell
export BAP_PLANARIA_TOKEN=""
```

The token is a Planaria Token that can be created here: https://token.planaria.network/

And optionally overwrite the defaults for the database:

```shell
export MONGO_URL="mongodb://localhost:27017/bap-planaria"
export BAP_DB_NAME="bap-planaria"
```

Indexing BAP blocks can now be done by running

```shell
bap-planaria
```

If you want to run continuously and also listen to the mempool, run:

```shell
bap-planaria -a watch
```

It's also possible to get transactions directly from bitbus with the bap-planaria cli

```shell
bap-planaria -a get -t <txId>
```

Or run a query for at most 10 transactions

```shell
bap-planaria -a get -q '{"out.tape.cell":"1BAPSuaPnfGnSBM3GLV9yhxUdYe4vGbdMT"}' -p bob
```

The arguments to the bap-planaria cli are:

| arg             | Description                                                                                            |
| --------------- |------------------------------------------------------------------------------------------------------- |
| `-a <action>`   | Action to call (`index` (default), `watch`, `get`)                                                     |
| `-t <txId>`     | Transaction Id to search for. Only works together with `-a get`                                        |
| `-q <query>`    | JSON stringified query. Only works together with `-a get`                                              |
| `-p <parser>`   | Parser to use for the returned transaction (`txo` (default), `bob`). Only works together with `-a get` |

# local installation

```
git clone https://github.com/icellan/bap-planaria.git
```

BAP-planaria can run either with settings from a config file (`config.json`) or from environment variables.

config.json
```json
{
  "token": "ey...",
  "mongoUrl": "mongodb://...",
  "dbName": "bap-planaria"
}
```

environment
```shell
export BAP_PLANARIA_TOKEN="ey..."
export BAP_DB_NAME="bap-planaria"
export MONGO_URL="mongo://..."
```

## run

To run the indexer once to index all blocks:

```shell
./start.sh
```

To run the indexer in watch mode, which also indexes all transactions in the mempool:

```shell
./watch.sh
```

## testing 

```shell
npm run test
```
or

```shell
npm run testwatch
```

# Including in your own package or site

```
npm install bap-planaria
```

```javascript
import { indexBAPTransactions } from 'bap-planaria/src/bap';

process.env.BAP_PLANARIA_TOKEN = '<planaria token>';
process.env.MONGO_URL = 'mongodb://localhost:27017/bap-planaria';
process.env.BAP_DB_NAME = 'bap-planaria';

(async function() {
  await indexBAPTransactions();
})();
```

or

```javascript
import { watchBAPTransactions } from 'bap-planaria/src/watch';

process.env.BAP_PLANARIA_TOKEN = '<planaria token>';
process.env.MONGO_URL = 'mongodb://localhost:27017/bap-planaria';
process.env.BAP_DB_NAME = 'bap-planaria';

(async function() {
  await watchBAPTransactions();
})();
```

Make sure babel is set up properly or that es6 is supported by your own package.
