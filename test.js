const assert = require('assert');
const NanoNode = require('.');

// 2 instances are started, one on a random port and one on a fixed port
const FIXED_PORT = 12121;
const HEADER_EXPECTED = '5243070701';

const cases = [];

// Each case gets 2 NanoNode instances, the second contains the first as a peer
function testCase(caseName, test) {
  cases.push(function(cb) {
    let node1, node2;

    node1 = new NanoNode();
    node1.peers.splice(0, node1.peers.length);

    node1.on('error', error => {
      console.log('node1', error);
      process.exit(1);
    });

    const done = () => {
      console.log(caseName, 'ok');
      node1.client.close();
      node2.client.close();
      cb();
    };


    node1.on('ready', () => {
      const address1 = node1.client.address();
      node2 = new NanoNode(FIXED_PORT);
      node2.peers.splice(0, node2.peers.length);

      node2.on('error', error => {
        console.log('node2', error);
        process.exit(1);
      });

      node2.on('ready', () => {
        const address2 = node2.client.address();
        assert(address2.port === FIXED_PORT, 'Fixed listening port incorrect');
        // Initial introduction
        node2.peers.push('127.0.0.1:' + address1.port);

        test(node1, node2, address1.port, done);
      });
    });
  });
}

function fixHexCase(obj) {
  return Object.keys(obj).reduce((prev, cur) => {
    if(cur === 'type') prev[cur] = obj[cur];
    else prev[cur] = Buffer.from(obj[cur], 'hex').toString('hex');
    return prev;
  }, {});
}

// Keepalive rendered, parsed, and propagated
testCase('keepalive', (node1, node2, node1Port, done) => {
  node1.on('message', (msg, rinfo) => {
    // Node1 receives keepalive from node2, with node2 as peer
    assert(msg.type === 'keepalive');
    assert(msg.body instanceof Array && msg.body.length === 1);
    assert(msg.body[0] === '127.0.0.1:' + FIXED_PORT);
  });

  node2.on('message', (msg, rinfo) => {
    // Node1 publishes keepalive back to Node2, but without any peers
    assert(rinfo.port === node1Port);
    assert(msg.type === 'keepalive');
    assert(msg.body instanceof Array && msg.body.length === 0);
    done();
  });

  node2.publish({
    type: 'keepalive',
    body: [ '127.0.0.1:' + FIXED_PORT ]
  });
});

// Each block type can be rendered, published, received, and parsed successfully
[
  {
    obj: {
      type: 'send',
      previous: '77F062C61390ABA81427DCAB56FE7DD2463CFD048E4B9FD9402D7845A0CF8087',
      destination: NanoNode.keyFromAccount('xrb_1tp4yq5x58qyyygxyrmtch5bqdcrhmabbbkykkjqod4jhknuha3rak5ukc1z'),
      balance: '00000000000000000000000000000000',
      signature: '4CD06C22D01F31AA373AD1A44E9D2C58472CB3137C210E13E0125ED5AADD421BA8AB679B6318B4688AC581A11129AB3A2503845DA33E65DC555F15759102130E',
      work: '88d59d8e1b1f8eba'
    },
    hex: '000277f062c61390aba81427dcab56fe7dd2463cfd048e4b9fd9402d7845a0cf80876ac2f5c7d19afef79ddf627a53c69bad587cd094a65e94a37aac517ca9b7a038000000000000000000000000000000004cd06c22d01f31aa373ad1a44e9d2c58472cb3137c210e13e0125ed5aadd421ba8ab679b6318b4688ac581a11129ab3a2503845da33e65dc555f15759102130eba8e1f1b8e9dd588'
  },
  {
    obj: {
      type: 'receive',
      previous: '77F062C61390ABA81427DCAB56FE7DD2463CFD048E4B9FD9402D7845A0CF8087',
      source: '90FB3C55B1CFF0B10AF6D09FA9DFC115D5014B63256A0F5F264E06FA14DA5363',
      signature: '4CD06C22D01F31AA373AD1A44E9D2C58472CB3137C210E13E0125ED5AADD421BA8AB679B6318B4688AC581A11129AB3A2503845DA33E65DC555F15759102130E',
      work: '88d59d8e1b1f8eba'
    },
    hex: '000377f062c61390aba81427dcab56fe7dd2463cfd048e4b9fd9402d7845a0cf808790fb3c55b1cff0b10af6d09fa9dfc115d5014b63256a0f5f264e06fa14da53634cd06c22d01f31aa373ad1a44e9d2c58472cb3137c210e13e0125ed5aadd421ba8ab679b6318b4688ac581a11129ab3a2503845da33e65dc555f15759102130eba8e1f1b8e9dd588'
  },
  {
    obj: {
      type: 'open',
      source: '90FB3C55B1CFF0B10AF6D09FA9DFC115D5014B63256A0F5F264E06FA14DA5363',
      representative: NanoNode.keyFromAccount('xrb_1tp4yq5x58qyyygxyrmtch5bqdcrhmabbbkykkjqod4jhknuha3rak5ukc1z'),
      account: NanoNode.keyFromAccount('xrb_37n4qbnjij3786ow1jh46jk8wjk9s7umwdsy7kphi1kjwim3yupukkrkppgp'),
      signature: '4CD06C22D01F31AA373AD1A44E9D2C58472CB3137C210E13E0125ED5AADD421BA8AB679B6318B4688AC581A11129AB3A2503845DA33E65DC555F15759102130E',
      work: '88d59d8e1b1f8eba'
    },
    hex: '000490fb3c55b1cff0b10af6d09fa9dfc115d5014b63256a0f5f264e06fa14da53636ac2f5c7d19afef79ddf627a53c69bad587cd094a65e94a37aac517ca9b7a0389682ba69184425312bc045e224646e4647c9773e2f3e2cacf80251e4261f6edb4cd06c22d01f31aa373ad1a44e9d2c58472cb3137c210e13e0125ed5aadd421ba8ab679b6318b4688ac581a11129ab3a2503845da33e65dc555f15759102130eba8e1f1b8e9dd588'
  },
  {
    obj: {
      type: 'change',
      previous: '77F062C61390ABA81427DCAB56FE7DD2463CFD048E4B9FD9402D7845A0CF8087',
      representative: NanoNode.keyFromAccount('xrb_1tp4yq5x58qyyygxyrmtch5bqdcrhmabbbkykkjqod4jhknuha3rak5ukc1z'),
      signature: '4CD06C22D01F31AA373AD1A44E9D2C58472CB3137C210E13E0125ED5AADD421BA8AB679B6318B4688AC581A11129AB3A2503845DA33E65DC555F15759102130E',
      work: '88d59d8e1b1f8eba'
    },
    hex: '000577f062c61390aba81427dcab56fe7dd2463cfd048e4b9fd9402d7845a0cf80876ac2f5c7d19afef79ddf627a53c69bad587cd094a65e94a37aac517ca9b7a0384cd06c22d01f31aa373ad1a44e9d2c58472cb3137c210e13e0125ed5aadd421ba8ab679b6318b4688ac581a11129ab3a2503845da33e65dc555f15759102130eba8e1f1b8e9dd588'
  },
  {
    obj: {
      type: 'state',
      previous: '77F062C61390ABA81427DCAB56FE7DD2463CFD048E4B9FD9402D7845A0CF8087',
      balance: '00000000000000000000000000000000',
      representative: NanoNode.keyFromAccount('xrb_1tp4yq5x58qyyygxyrmtch5bqdcrhmabbbkykkjqod4jhknuha3rak5ukc1z'),
      account: NanoNode.keyFromAccount('xrb_37n4qbnjij3786ow1jh46jk8wjk9s7umwdsy7kphi1kjwim3yupukkrkppgp'),
      link: '90FB3C55B1CFF0B10AF6D09FA9DFC115D5014B63256A0F5F264E06FA14DA5363',
      signature: '4CD06C22D01F31AA373AD1A44E9D2C58472CB3137C210E13E0125ED5AADD421BA8AB679B6318B4688AC581A11129AB3A2503845DA33E65DC555F15759102130E',
      work: '88d59d8e1b1f8eba'
    },
    hex: '00069682ba69184425312bc045e224646e4647c9773e2f3e2cacf80251e4261f6edb77f062c61390aba81427dcab56fe7dd2463cfd048e4b9fd9402d7845a0cf80876ac2f5c7d19afef79ddf627a53c69bad587cd094a65e94a37aac517ca9b7a0380000000000000000000000000000000090fb3c55b1cff0b10af6d09fa9dfc115d5014b63256a0f5f264e06fa14da53634cd06c22d01f31aa373ad1a44e9d2c58472cb3137c210e13e0125ed5aadd421ba8ab679b6318b4688ac581a11129ab3a2503845da33e65dc555f15759102130e88d59d8e1b1f8eba'
  },
].forEach((thisCase, index) => {
  // s: string message type, i: index of type as hex string
  [ { s: 'publish', i: '03' }, { s: 'confirm_req', i: '04' } ].forEach(msgType => {
    testCase(msgType.s + '-' + (index + 1) + '-' + thisCase.obj.type,
      (node1, node2, node1Port, done) => {

        node1.on('message', (msg, rinfo) => {
          assert(msg.type === msgType.s);
          const expectedBody = Object.assign({ hash: rendered.hash }, thisCase.obj);
          // fixHexCase() removes any hex letter case differences
          assert.deepStrictEqual(fixHexCase(msg.body), fixHexCase(expectedBody),
            'parsed body mismatch');
          done();
        });

        node2.on('message', (msg, rinfo) => {
          assert(false, 'unexpected message on node2');
        });

        const rendered = NanoNode.renderMessage({
          type: msgType.s,
          body: thisCase.obj
        });

        // Omit the hex value to see print the rendered value
        if(!thisCase.hex) console.log(rendered.message.toString('hex'));

        const expectedRender = HEADER_EXPECTED + msgType.i + thisCase.hex;

        assert(rendered.message.toString('hex') === expectedRender,
          'rendered message mismatch');

        node2.publish(rendered.message);
      }
    );
  });
});

// Beginning executing queued test cases
function execCase() {
  if(!cases.length) return;
  cases.shift()(execCase);
}
execCase();
