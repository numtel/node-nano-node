# Node.js Nano Node

[![Build Status](https://travis-ci.org/numtel/node-nano-node.svg?branch=master)](https://travis-ci.org/numtel/node-nano-node)

Partial (light, leech) Node for [Nano currency](https://nano.org) (Formerly [Raiblocks](https://raiblocks.net)) for Node.js.

**Examples:**

* [Pending](examples/pending.js): How to listen for new pending blocks on a specific account
* [Receive](examples/receive.js): How to publish a block
* [Pull](examples/pull.js): How to fetch an account blockchain history
* [Votes](examples/votes.js): How to listen for representative votes
* [State Blocks](examples/stateblocks.js): How to listen for state blocks

## Table of Contents

* [Installation](#installation)
* [class NanoNode extends EventEmitter](#class-nanonode-extends-eventemitter)
  * [Events Emitted](#events-emitted)
  * [Properties](#properties)
  * [constructor(port)](#constructorport)
  * [publish(msg, accountKey, callback)](#publishmsg-accountkey-callback)
  * [fetchAccount(publicKey, callback)](#fetchaccountpublickey-callback)
  * [Static parseMessage(buf, minimalConfirmAck)](#static-parsemessagebuf-minimalconfirmack)
  * [Static renderMessage(msg, accountKey)](#static-rendermessagemsg-accountkey)
  * [Static keyFromAccount(account)](#static-keyfromaccountaccount)
  * [Static accountFromKey(key)](#static-accountfromkeykey)
  * [Static accountPair(seed, index)](#static-accountpairseed-index)

## Installation

```
npm install --save nano-node
```

## class NanoNode extends EventEmitter

### Events Emitted

Name | Listener Arguments | Description
-----|-------------------|-----------------------
`message` | `msg`, `rinfo` | Network message received
`block` | `block`, `rinfo` | Block received (messages of `publish` type)
`vote` | `msg`, `rinfo` | Vote received (messages of `confirm_ack` type)
`ready` | *None* | Server is listening
`error` | `error` | An error has occurred

### Properties

May be set after construction.

Name | Description
-----|---------------
`peers` | Array of strings containing hostname concatenated with a colon and the port<br>Default: `['rai.raiblocks.net:7075']`
`maxPeers` | Maximum number of latest peers to publish new messages<br>Default: 200
`minimalConfirmAck` | Parsing and validating each `confirm_ack` message as it arrives is very compute intensive due to the 2 blake2b hashes calculated on each receive. Set this value to `false` to parse and validate `comfirm_ack` messages. By default, (`true`) only the `account` public key is parsed.
`tcpTimeout` | Duration to wait when performing TCP operations in milliseconds<br>Default: 4000

### constructor(port)

* `port` `<Integer>` Optional, random if unspecified

Create a new listening UDP service.

### publish(msg, accountKey, callback)

* `msg` `<Object>` Required, message definition, supports types `keepalive`, `publish`, `confirm_req`. May also pass fully rendered messages as `Buffer`.
* `accountKey` `<String>` If `publish` message and no signature provided, pass account private key as hex string for block signing.
* `callback` `<Function>` Optional, callback function

Publish a message to known peers. Known peers are managed automatically. Upon receiving a message, the peer is added to the top of the list. Up to `maxPeers` peers are kept.

**Returns** only on `publish` and `confirm_req` messages: hex block hash

Publishing regular `keepalive` messages is important to continure receiving messages:

```js
const NanoNode = require('nano-node');
const node = new NanoNode();
setInterval(() => {
  console.log('Sending keepalive to ', node.peers.length, 'peers...');
  node.publish({type: 'keepalive'});
}, 30000);
```

#### Message Properties


Name | Default | Type | Description
-----|--------|-------|--------------
`type` | *None* | String | Required, `keepalive` or `publish`
`mainnet` | `true` | Boolean | Optional, True (default) for mainnet, false for testnet
`versionMax` | `7` | Integer | Optional
`versionUsing` | `7` | Integer | Optional
`versionMin` | `1` | Integer | Optional
`extensions` | `0` | Integer | Optional, overwritten with block type for `publish` messages
`body` | *None* | Object | Required for `publish` messages

#### Publish Body Object Properties


Name | Required Types | Type | Description
-----|----------------|----|---
`type` | *All* | String | `send`, `receive`, `open`, `change`, `state`
`previous` | `send`, `receive`, `change`, `state` | 64 character hex string | Hash of previous block in account
`destination` | `send` | 64 character hex string | Account public key of recipient
`balance` | `send`, `state` | 32 character hex string | New balance of account
`source` | `receive`, `open` | 64 character hex string | Hash of pending `send` block
`representative` | `open`, `change`, `state` | 64 character hex string | Public key of representative account to assign
`account` | `open`, `state` | 64 character hex string | Public key of the current account
`link` | `state` | 64 character hex string | Public key of the current account
`signature` | *Optional* | 128 character hex string | Pass precomputed signature in this property. Otherwise, pass `accountKey` argument for block signing.
`work` | *All* | 16 character hex string | Required for all block types, calculated from account public key for `open` type blocks, previous block hash for all other block types. See [raiblocks-pow NPM package](https://github.com/numtel/node-raiblocks-pow) for generating this value.

### fetchAccount(publicKey, callback)

* `publicKey` `<String>` Required, account public key to fetch block history
* `callback` `<Function>` `error, result`

Connect to known peers over TCP and send a `bulk_pull` message for a single account. Wait until timeout from `tcpTimeout` property, then determine the longest valid chain returned.

Without a full lattice database, the balance of an account can not be determined unless the frontier block is a `send` block.

**Result object properties:**

Name | Type | Description
----|-------|--------------
`blocks`| Array | Transaction history sorted newest to oldest
`matchProportion`| Number | Between 0 and 1 indicating the proportion of peer responses that match this chain. A value of 1 means all responding peers agree on this length.
`returnCount`| Number | Count of peer responses returned before timeout

### Static parseMessage(buf, minimalConfirmAck)

* `buf` `<Buffer>` Required, full UDP message
* `minimalConfirmAck` `<Boolean>` Optional, default: true. Only parse account value of vote (confirm_ack) messages

Returns an object with the properties of the message

### Static renderMessage(msg, accountKey)

Useful for obtaining a block's hash without publishing it yet.

* `msg` `<Object>` Required, message properties as described above
* `accountKey` `<String>` Required to sign blocks for `publish`, `confirm_req` messages, otherwise provide signature property

Returns an object `{ message: <Buffer>, hash: <String|null> }` `hash` is block hash if available

### Static keyFromAccount(account)

* `account` `<String>` Required, account address to convert

Return the public key for a given address

### Static accountFromKey(key)

* `key` `<String>` Required, public key to convert

Return the address for a given account public key

### Static accountPair(seed, index)

* `seed` `<String|Buffer>` Required, wallet seed as 32 byte Buffer or 64 character hex string
* `index` `<Number>` Required, 32-bit unsigned integer specifying account index

Returns an object `{privateKey: <String>, publicKey: <String>, address: <string>}`

## License

MIT
