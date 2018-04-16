const NanoNode = require('..');

const node = new NanoNode(12000);

const watchAccount = 'xrb_3arg3asgtigae3xckabaaewkx3bzsh7nwz7jkmjos79ihyaxwphhm6qgjps4';

node.on('vote', (msg, rinfo) => {
  var account = NanoNode.accountFromKey(msg.account);
  if(account == watchAccount)
    console.log('Vote from ' + NanoNode.accountFromKey(msg.account) + ' via ' + rinfo.address + ':' + rinfo.port);
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

