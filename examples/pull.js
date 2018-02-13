const NanoNode = require('..');

const node = new NanoNode();
const acct = NanoNode.keyFromAccount('xrb_replacethisvalue');

node.on('ready', () => {
  const address = node.client.address();
  console.log(`server listening ${address.address}:${address.port}`);
  // Initial introduction will result in at least a few peers
  node.publish({ type: 'keepalive' });
});

let hasFetched = false;
node.on('message', (msg, rinfo) => {
  // As soon as maxPeers is reached, fetch the account history
  if(!hasFetched && node.peers.length === node.maxPeers) {
    hasFetched = true;
    node.fetchAccount(acct, (error, result) => {
      account = result;
      console.log(error, result);
      node.client.close();
    });
  }
});

setTimeout(() => {
  console.log('Peer count', node.peers.length);
  if(node.peers.length === 1) {
    console.log('Failed to connect, please try again...');
  }
}, 3000);


