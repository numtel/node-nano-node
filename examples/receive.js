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
setInterval(() => {
  node.publish({
    type: 'publish',
    body: {
      type: 'receive',
      // Latest block hash on this account (frontier)
      previous: '0955673479E1183223A953A4E7737B3D50AF207E76DD421E1FBBC75CF8B8E138',
      // Block hash of the pending 'send' block
      source: 'DA5438F942D73160EBEF76CE3FC8A3EF38F66493720E8AA1AD359341A29F036E',
      // Calculated based of the block hash 'previous'
      work: 'b7fafd3c7eba801a'
    }
  },
  // Also pass account private key for signing block
  'D95FEEEB8B08DA598821A72199141ED75D5860BCCB0CA4E041E1387207F9C993');
}, 10000);

