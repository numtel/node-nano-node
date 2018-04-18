const NanoNode = require('..');

const node = new NanoNode(12000);

node.on('block', (block, rinfo) => {
  if(block.type === 'state')
    console.log(block)
});

node.on('error', error => {
  console.log(error);
});


node.on('ready', () => {
  const address = node.client.address();
  console.log(`server listening ${address.address}:${address.port}`);
  // Initial introduction
  node.publish({ type: 'keepalive' });
});

// Send keepalive at regular interval to known peers,
//  maxPeers will be reached very quickly
setInterval(() => {
  console.log('Sending keepalive to ', node.peers.length, 'peers...');
  node.publish({type: 'keepalive'});
}, 30000);

