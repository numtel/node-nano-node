const NanoNode = require('..');

const node = new NanoNode();

node.on('ready', () => {
  const address = node.client.address();
  console.log(`server listening ${address.address}:${address.port}`);
  // Initial introduction will result in at least a few peers
  node.publish({ type: 'keepalive' });
});

// Wait for some initial peer response before sending, not required but
//  improves chances of block propagation
setTimeout(() => {
  console.log('Publishing block to', node.peers.length, 'peers...');
  console.log(node.publish({
    type: 'publish',
    body: {
      type: 'receive',
      // Latest block hash on this account (frontier)
      previous: '6674116837E39DC27D3EDA360EEACBEE38293896C2EC19D91CEF41A8E9649DB2',
      // Block hash of the pending 'send' block
      source: '2163B77BC0C31A58B2E2B9448F22D360E60EB9B6A5EDBCE328924DD371E65474',
      // Calculated based of the block hash 'previous'
      work: '985a57eaa0dcb3c2'
    }
  },
  // Also pass account private key for signing block
  'A95C7460479F4DBB14F6E7D2A1EB4B2C5E75C1F9EE386CC5F5CDCBB8F147E565',
  // Optional callback after all messages have been sent
  () => {
    console.log('Publish complete');
  }));
}, 10000);

