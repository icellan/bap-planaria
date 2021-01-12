# bap-planaria
> BAP transaction indexer

BAP-planaria is a [Bitbus](https://docs.bitbus.network/) compatible Bitcoin Attestation Protocol indexer. It scans all BAP transactions and processes them into a global BAP state using the bitsocket.network servers.

**NOTE:** This is still work in progress and should be considered beta software. Issues / requests and PR's are welcome.

# install

```
git clone https://github.com/icellan/bap-planaria.git
```

# configuration

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
The token is a Planaria Token that can be created here: https://token.planaria.network/

# run

To run the indexer once to index all blocks:

```
./start.sh
```

To run the indexer in watch mode, which also indexes all transactions in the mempool:

```
./watch.sh
```

# testing 

```
npm run test
```
or

```
npm run testwatch
```
