# Node.js Nano Node

UDP Node for [Nano currency](https://nano.org) (Formerly [Raiblocks](https://raiblocks.net)) for Node.js.

## Installation

```
npm install --save nano-node
```

## class NanoNode extends EventEmitter

### Events Emitted

Name | Listener Arguments | Description
-----|-------------------|-----------------------
`message` | `msg`, `rinfo` | Network message received
`block` | `block` | Block received (messages of `publish` type)
`vote` | `msg` | Vote received (messages of `confirm_ack` type)
`ready` | *None* | Server is listening
`error` | `error` | An error has occurred

### Properties

May be set after construction.

Name | Description
-----|---------------
`peers` | Array of strings containing hostname concatenated with a colon and the port<br>Default: `['rai.raiblocks.net:7075']`
`maxPeers` | Maximum number of latest peers to publish new messages<br>Default: 200

### constructor(port)

* `port` `<Integer>` Optional, random if unspecified

Create a new listening UDP service.

### publish(msg, accountKey, callback)

* `msg` `<Object>` Required, message definition, currently only supports types `keepalive`, `publish`.
* `accountKey` `<String>` If `publish` message and no signature provided, pass account private key as hex string for block signing.
* `callback` `<Function` Optional, callback function

Publish a message to known peers. Known peers are managed automatically. Upon receiving a message, the peer is added to the top of the list. Up to `maxPeers` peers are kept.

**Returns** only publish messages: hex block hash

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

See [examples/pending.js](examples/pending.js) for an example of how to listen for new pending blocks on a specific account.

Name | Default | Type | Description
-----|--------|-------|--------------
`type` | *None* | String | Required, `keepalive` or `publish`
`mainnet` | `true` | Boolean | Optional, True (default) for mainnet, false for testnet
`versionMax` | `5` | Integer | Optional
`versionUsing` | `5` | Integer | Optional
`versionMin` | `1` | Integer | Optional
`extensions` | `0` | Integer | Optional, overwritten with block type for `publish` messages
`body` | *None* | Object | Required for `publish` messages

#### Publish Body Object Properties

See [examples/receive.js](examples/receive.js) for an example of how to publish a block.

Name | Required Types | Type | Description
-----|----------------|----|---
`type` | *All* | String | `send`, `receive`, `open`, `change`
`previous` | `send`, `receive`, `change` | 64 character hex string | Hash of previous block in account
`destination` | `send` | 64 character hex string | Account public key of recipient
`balance` | `send` | 32 character hex string | New balance of account
`source` | `receive`, `open` | 64 character hex string | Hash of pending `send` block
`representative` | `open`, `change` | 64 character hex string | Public key of representative account to assign
`account` | `open` | 64 character hex string | Public key of the current account
`signature` | *Optional* | 128 character hex string | Pass precomputed signature in this property. Otherwise, pass `accountKey` argument for block signing.
`work` | *All* | 16 character hex string | Required for all block types, calculated from account public key for `open` type blocks, previous block hash for all other block types. See [raiblocks-pow NPM package](https://github.com/numtel/node-raiblocks-pow) for generating this value.

### Static keyFromAccount(account)

* `account` `<String>` Required, account address to convert

Return the public key for a given address

### Static accountFromKey(key)

* `key` `<String>` Required, public key to convert

Return the address for a given account public key

## License

MIT
