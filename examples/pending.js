const NanoNode = require('..');

const node = new NanoNode();

const watchAccount =
  NanoNode.keyFromAccount('xrb_3a7yzpzt9m3zn61weq3xakk5r1cryhxh4kqn73umojks1uzgg4ipc8jii5km');

node.on('block', block => {
  // Print pending plocks for this account
  if(block.destination === watchAccount)
    console.log(block);
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

