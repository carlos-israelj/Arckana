# Publishing iApp Orders Guide

This guide explains how to publish app orders for the Arckana Dividend Calculator iApp on iExec marketplace.

## What is an App Order?

An **app order** is a signed proposal that defines usage conditions for your iApp:

- **Price per execution** (in nRLC)
- **Number of authorized uses** (volume)
- **Access restrictions** (users, workerpools, datasets)
- **TEE configuration** (for confidential execution)

**Formula:** `Deployed iApp + Published Signed App Order = Application accessible on iExec`

---

## Prerequisites

- ✅ iApp deployed on Arbitrum Sepolia
- ✅ Wallet with private key in `iapp.config.json`
- ✅ Node.js and npm installed
- ✅ Dependencies installed (`npm install` in this directory)

---

## Quick Start: Using the Sign & Publish Script

We provide a ready-to-use script that handles signing and publishing automatically.

### Step 1: Install Dependencies

```bash
cd iapp/arckana-dividend-calculator
npm install
```

### Step 2: Verify Configuration

Check that `iapp.config.json` has your wallet private key:

```json
{
  "walletPrivateKey": "0xYourPrivateKeyHere",
  ...
}
```

### Step 3: Run the Script

```bash
node sign-and-publish-order.js
```

**Expected Output:**
```
Creating app order...
Signing app order...
Signed!
Publishing app order...

✅ Success!
Order hash: 0x2746f6704b69bf90e35552356481cafda5831620f51ebf864d24c1d4eaf0583f
Saved to orders.json
```

### Step 4: Verify Order Published

Check the iExec marketplace:

```bash
iexec orderbook app 0x02Bf69af102322c8c27E8D350a1541E61B6959d8 --chain arbitrum-sepolia-testnet
```

You should see:
```
✔ Apporders details (1 to 1 of 1):
- orderHash: 0x2746f6704b69bf90e35552356481cafda5831620f51ebf864d24c1d4eaf0583f
  price:     0
  remaining: 1000000
  tag:       0x0000000000000000000000000000000000000000000000000000000000000003
```

---

## App Order Configuration

The script creates an order with these parameters:

```javascript
{
  app: '0x02Bf69af102322c8c27E8D350a1541E61B6959d8',  // Your iApp address
  appprice: 0,                                        // Free (0 nRLC)
  volume: 1000000,                                    // 1 million uses
  tag: '0x...03',                                     // TEE required (Scone)
  datasetrestrict: '0x0000...0000',                   // No dataset restriction
  workerpoolrestrict: '0x0000...0000',                // Any workerpool
  requesterrestrict: '0x0000...0000',                 // Any user
}
```

### Parameter Explanation

| Parameter | Value | Description |
|-----------|-------|-------------|
| `app` | `0x02Bf69af102322c8c27E8D350a1541E61B6959d8` | Your deployed iApp address |
| `appprice` | `0` | Free execution (0 nRLC per use) |
| `volume` | `1000000` | Number of authorized executions |
| `tag` | `0x...03` | Requires TEE (Scone framework) |
| `datasetrestrict` | `0x0000...0000` | No restriction on datasets |
| `workerpoolrestrict` | `0x0000...0000` | Can run on any workerpool |
| `requesterrestrict` | `0x0000...0000` | Anyone can use the iApp |

---

## Understanding the Script

The `sign-and-publish-order.js` script performs these steps:

### 1. Read Configuration
```javascript
const config = JSON.parse(
  await fsPromises.readFile('./iapp.config.json', 'utf8')
);
const privateKey = config.walletPrivateKey;
```

### 2. Initialize iExec SDK
```javascript
const ethProvider = utils.getSignerFromPrivateKey(
  'https://sepolia-rollup.arbitrum.io/rpc',
  privateKey
);

const iexec = new IExec(
  { ethProvider },
  {
    hubAddress: '0xB2157BF2fAb286b2A4170E3491Ac39770111Da3E',
    isNative: false,
    chainId: '421614',
  }
);
```

### 3. Create App Order
```javascript
const appOrder = await iexec.order.createApporder({
  app: '0x02Bf69af102322c8c27E8D350a1541E61B6959d8',
  appprice: 0,
  volume: 1000000,
  tag: '0x0000000000000000000000000000000000000000000000000000000000000003',
  // ... other parameters
});
```

### 4. Sign the Order
```javascript
const signedAppOrder = await iexec.order.signApporder(appOrder);
```

### 5. Publish to Marketplace
```javascript
const publishedOrder = await iexec.order.publishApporder(signedAppOrder);
```

### 6. Save Locally
```javascript
await fsPromises.writeFile(
  'orders.json',
  JSON.stringify({
    "421614": { "apporder": signedAppOrder }
  }, null, 2)
);
```

---

## Alternative: Using iExec CLI

If you prefer using the official iExec CLI:

### Step 1: Install iExec CLI

```bash
npm install -g iexec
```

### Step 2: Import Wallet

```bash
iexec wallet import <your-private-key>
```

### Step 3: Initialize Order Config

```bash
iexec order init --app
```

This adds an `apporder` section to `iexec.json`. Edit it with your parameters.

### Step 4: Sign the Order

```bash
iexec order sign --app --chain arbitrum-sepolia-testnet
```

### Step 5: Publish the Order

```bash
iexec order publish --app --chain arbitrum-sepolia-testnet
```

---

## Troubleshooting

### Error: "No App order found for the desired price"

**Cause:** The app order hasn't been published or the price doesn't match.

**Solution:**
1. Run `sign-and-publish-order.js` to publish the order
2. Verify with `iexec orderbook app <your-app-address>`
3. Make sure `appMaxPrice` in your frontend code is >= `appprice` in the order

### Error: "Unsupported provider" or "Not a signer"

**Cause:** Old version of the script or SDK incompatibility.

**Solution:**
```javascript
// Use utils.getSignerFromPrivateKey instead of direct provider
const ethProvider = utils.getSignerFromPrivateKey(
  'https://sepolia-rollup.arbitrum.io/rpc',
  privateKey
);
```

### Order Hash is `undefined`

**Cause:** Older versions of iExec SDK don't return orderHash directly.

**Impact:** None. The order is still published successfully.

**Verification:** Check with `iexec orderbook app <address>`

---

## Managing Orders

### View Published Orders

```bash
iexec orderbook app 0x02Bf69af102322c8c27E8D350a1541E61B6959d8 --chain arbitrum-sepolia-testnet
```

### Update Order (Create New)

To change conditions, create and publish a new order with different parameters.

### Cancel Order

```bash
iexec order cancel --app <orderHash> --chain arbitrum-sepolia-testnet
```

---

## Security Notes

⚠️ **Never commit wallet files to git:**
- `UTC--*` files (encrypted wallets)
- `iapp.config.json` with private keys
- `.secret` files

✅ **Safe to commit:**
- `sign-and-publish-order.js` (the script)
- `orders.json` (signed orders without private key)
- `package.json` (dependencies)

---

## Files Generated

After running the script:

```
iapp/arckana-dividend-calculator/
├── iapp.config.json          # Configuration with private key (DO NOT COMMIT)
├── sign-and-publish-order.js # Publishing script (COMMIT)
├── orders.json               # Signed order (COMMIT)
├── package.json              # Dependencies (COMMIT)
└── UTC--2026-...             # Encrypted wallet (DO NOT COMMIT)
```

---

## Next Steps

After publishing your app order:

1. ✅ Update frontend code with `appMaxPrice` parameter
2. ✅ Test iApp execution from Admin Panel
3. ✅ Monitor executions on [iExec Explorer](https://explorer.iex.ec/arbitrum-sepolia-testnet)

---

## Additional Resources

- [iExec SDK Documentation](https://github.com/iExecBlockchainComputing/iexec-sdk)
- [iApp Generator Docs - Manage Access](https://docs.iapp.dev/docs/build/manage-access)
- [iExec Order Book API](https://api.market.iex.ec)
- [Arbitrum Sepolia Explorer](https://explorer.iex.ec/arbitrum-sepolia-testnet)

---

## Support

If you encounter issues:
1. Check the [iExec Discord](https://discord.gg/iexec)
2. Review [iExec SDK GitHub Issues](https://github.com/iExecBlockchainComputing/iexec-sdk/issues)
3. Consult [iApp Generator Documentation](https://docs.iapp.dev)
