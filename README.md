# bap-planaria
> BAP transaction indexer

BAP-planaria is a [Bitbus](https://docs.bitbus.network/) compatible Bitcoin Attestation Protocol indexer. It scans all BAP transactions and processes them into a global BAP state using the bitsocket.network servers.

**NOTE:** This is still work in progress and should be considered beta software. Issues / requests and PR's are welcome.

# global installation

```
npm install -g bap-planaria
```

Set the environment variables. You must at least set the planaria token.

```
export BAP_PLANARIA_TOKEN=""
```

The token is a Planaria Token that can be created here: https://token.planaria.network/

And optionally overwrite the defaults for the database:

```
export MONGO_URL="mongodb://localhost:27017/bap-planaria"
export BAP_DB_NAME="bap-planaria"
```

Indexing BAP blocks can now be done by running

```
bap-planaria
```

If you want to run continuously and also listen to the mempool, run:

```
bap-planaria -a watch
```

It's also possible to get transactions directly from bitbus with the bap-planaria cli

```
bap-planaria -a get -t <txId>
```

Or run a query for at most 10 transactions

```
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
```
{
  "token": "ey...",
  "mongoUrl": "mongodb://...",
  "dbName": "bap-planaria"
}
```

environment
```
export BAP_PLANARIA_TOKEN="ey..."
export BAP_DB_NAME="bap-planaria"
export MONGO_URL="mongo://..."
```

## run

To run the indexer once to index all blocks:

```
./start.sh
```

To run the indexer in watch mode, which also indexes all transactions in the mempool:

```
./watch.sh
```

## testing 

```
npm run test
```
or

```
npm run testwatch
```
