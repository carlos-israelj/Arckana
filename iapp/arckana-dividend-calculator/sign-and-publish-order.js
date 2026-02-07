const { IExec, utils } = require('iexec');
const fsPromises = require('fs').promises;

async function signAndPublishAppOrder() {
  try {
    const config = JSON.parse(
      await fsPromises.readFile('./iapp.config.json', 'utf8')
    );

    const privateKey = config.walletPrivateKey;

    // Create a signer from private key
    const ethProvider = utils.getSignerFromPrivateKey(
      'https://sepolia-rollup.arbitrum.io/rpc',
      privateKey
    );

    const iexec = new IExec(
      {
        ethProvider,
      },
      {
        hubAddress: '0xB2157BF2fAb286b2A4170E3491Ac39770111Da3E',
        isNative: false,
        chainId: '421614',
      }
    );

    console.log('Creating app order...');

    const appOrder = await iexec.order.createApporder({
      app: '0xB5CED46207D14A976971C21F241F2c39a921755D',
      appprice: 0,
      volume: 1000000,
      tag: '0x0000000000000000000000000000000000000000000000000000000000000003',
      datasetrestrict: '0x0000000000000000000000000000000000000000',
      workerpoolrestrict: '0x0000000000000000000000000000000000000000',
      requesterrestrict: '0x0000000000000000000000000000000000000000',
    });

    console.log('Signing app order...');
    const signedAppOrder = await iexec.order.signApporder(appOrder);
    console.log('Signed!');

    console.log('Publishing app order...');
    const publishedOrder = await iexec.order.publishApporder(signedAppOrder);

    console.log('\n✅ Success!');
    console.log('Order hash:', publishedOrder.orderHash);

    const ordersData = {
      "421614": {
        "apporder": signedAppOrder
      }
    };

    await fsPromises.writeFile('orders.json', JSON.stringify(ordersData, null, 2));
    console.log('Saved to orders.json');

    return publishedOrder;
  } catch (error) {
    console.error('Failed:', error);
    throw error;
  }
}

signAndPublishAppOrder()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
