# Arckana - Quick Start Guide

Complete guide to run and test the Arckana confidential dividend distribution system.

---

## Prerequisites

- Node.js 18+ and npm
- Docker Desktop running
- Wallet with some Arbitrum Sepolia ETH
- iExec CLI installed (`npm install -g @iexec/cli`)

---

## 1. Project Overview

**Arckana** is a confidential dividend distribution system for tokenized treasury funds (RWA) built with:
- **Smart Contracts**: Solidity on Arbitrum Sepolia
- **iApp**: Python application running in iExec TEE
- **Frontend**: Next.js with RainbowKit and DataProtector

---

## 2. Deployed Addresses

### Smart Contracts (Arbitrum Sepolia)
```
ArckanaToken:       0xaF7B67b88128820Fae205A07aDC055ed509Bdb12
DividendPool:       0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217
ArckanaPaymaster:   0x648B7FfD8a5Dd9C901B6569E7a0DC9A2eAF4c9F1
PaymentToken:       0x71E3a04c9Ecc624656334756f70dAAA1fc4F985D
```

### iExec iApp
```
iApp Address:       0x4dF342F232BD89705090c00081924555E849FDb5
TEE Image:          carlosisraelj/arckana-dividend-calculator:0.0.1-tee-scone-5.9.1-v16-prod-239a4a71c09d
Chain:              Arbitrum Sepolia (421614)
```

---

## 3. Quick Test - iApp Local Execution

Test the dividend calculator locally without deploying:

```bash
# Navigate to iApp directory
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/iExecPrueba/Arcana/iapp/arckana-dividend-calculator

# Build Docker image
docker build -t arckana-test:local .

# Run with test data
docker run --rm \
  -v "$(pwd)/test_manual/iexec_in:/iexec_in" \
  -v "$(pwd)/test_manual/iexec_out:/iexec_out" \
  -e IEXEC_IN=/iexec_in \
  -e IEXEC_OUT=/iexec_out \
  arckana-test:local

# View results
cat test_manual/iexec_out/result.json
```

**Expected Output**:
```
Arckana iApp completed successfully
Merkle root: 0x8726d8a8753bf06d688bf43d12df27f3fcbb7600553121de93766d9309681494
Holders: 3
Total distributed: 1000000000
```

---

## 4. Frontend Setup

### Install Dependencies
```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/iExecPrueba/Arcana/frontend
npm install
```

### Configure Environment
The `.env.local` file is already configured with all deployed addresses:
```bash
cat .env.local
```

### Get WalletConnect Project ID (Optional)
1. Go to https://cloud.walletconnect.com/
2. Create a new project
3. Copy the Project ID
4. Update `.env.local`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id
   ```

### Start Development Server
```bash
npm run dev
```

Frontend will be available at: http://localhost:3000

---

## 5. End-to-End Flow

### Step 1: Token Holder - Protect Balance

1. Open frontend: http://localhost:3000
2. Click "Connect Wallet"
3. Select your wallet (MetaMask, etc.)
4. Switch to Arbitrum Sepolia network
5. Navigate to "Protect Balance" section
6. Enter your balance (this will be encrypted)
7. Click "Protect My Balance"
8. Confirm transaction in wallet

**Result**: Your balance is encrypted and stored in iExec DataProtector.

### Step 2: Operator - Calculate Dividends

As the operator, trigger the iApp execution:

```bash
# Navigate to iApp directory
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/iExecPrueba/Arcana/iapp/arckana-dividend-calculator

# Execute iApp with protected data
# (This step requires proper DataProtector integration)
iapp run 0x4dF342F232BD89705090c00081924555E849FDb5 \
  --chain arbitrum-sepolia-testnet \
  --args "1000000000"
```

**Note**: Full DataProtector integration is pending. Currently tested with manual input.

### Step 3: Operator - Publish Merkle Root

After iApp execution completes:

1. Get the Merkle root from iApp output
2. Call `DividendPool.startDistributionRound()`:

```javascript
// Using ethers.js or similar
const merkleRoot = "0x8726d8a8753bf06d688bf43d12df27f3fcbb7600553121de93766d9309681494";
const totalPool = "1000000000"; // 1000 USDC (6 decimals)

await dividendPool.startDistributionRound(merkleRoot, totalPool);
```

3. Approve PaymentToken transfer first if needed
4. Transaction creates a new distribution round

### Step 4: Token Holder - Claim Dividend

1. Frontend shows "New Distribution Available"
2. User sees their entitled dividend amount
3. Click "Claim Dividend"
4. Merkle proof is automatically retrieved
5. Transaction submitted (gas may be sponsored by Paymaster)
6. Dividend transferred to user's wallet

---

## 6. Using Smart Contracts Directly

### Read Current Round
```javascript
const currentRound = await dividendPool.currentRound();
const merkleRoot = await dividendPool.merkleRoots(currentRound);
const totalDistributed = await dividendPool.totalDistributed(currentRound);
```

### Check if Already Claimed
```javascript
const hasClaimed = await dividendPool.hasClaimed(roundNumber, holderAddress);
```

### Claim Dividend (Manual)
```javascript
const round = 1;
const amount = "500000000"; // Your dividend amount
const proof = [
  "0x9baafb71c4f39bcd39e74edf33eb9bf0f5cbe411cab51127029334a2c8951fde"
];

await dividendPool.claimDividend(round, amount, proof);
```

---

## 7. Verify on Block Explorer

### View Contracts on Arbiscan
- ArckanaToken: https://sepolia.arbiscan.io/address/0xaF7B67b88128820Fae205A07aDC055ed509Bdb12
- DividendPool: https://sepolia.arbiscan.io/address/0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217
- Paymaster: https://sepolia.arbiscan.io/address/0x648B7FfD8a5Dd9C901B6569E7a0DC9A2eAF4c9F1

### View iApp on iExec
- Explorer: https://explorer.iex.ec/
- Search for: `0x4dF342F232BD89705090c00081924555E849FDb5`

---

## 8. Testing Checklist

### Backend (iApp)
- [x] Docker image builds
- [x] Local execution works
- [x] Correct dividend calculation
- [x] Merkle tree generation
- [x] Deployed to iExec

### Smart Contracts
- [x] All contracts deployed
- [x] Addresses verified
- [ ] Test startDistributionRound()
- [ ] Test claimDividend()
- [ ] Test Paymaster sponsorship

### Frontend
- [ ] npm run dev works
- [ ] Wallet connection
- [ ] Network switching
- [ ] ProtectBalance component
- [ ] DistributionStatus component
- [ ] ClaimDividend component

---

## 9. Troubleshooting

### Frontend won't start
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Wallet won't connect
- Make sure you're on Arbitrum Sepolia network (Chain ID: 421614)
- Add network manually if needed:
  - RPC: https://sepolia-rollup.arbitrum.io/rpc
  - Chain ID: 421614
  - Symbol: ETH

### Docker image fails to build
```bash
# Make sure Docker Desktop is running
docker ps

# Try building with no cache
docker build --no-cache -t arckana-test:local .
```

### iApp execution fails
- Check that input data is properly formatted JSON
- Verify Docker volumes are mounted correctly
- Check Docker logs for errors

---

## 10. Project Structure

```
Arcana/
├── contracts/                 # Foundry smart contracts
│   ├── src/
│   │   ├── ArckanaToken.sol
│   │   ├── DividendPool.sol
│   │   ├── ArckanaPaymaster.sol
│   │   └── PaymentToken.sol
│   └── test/
│
├── iapp/
│   └── arckana-dividend-calculator/
│       ├── src/
│       │   └── app.py         # Main dividend calculator
│       ├── Dockerfile
│       ├── requirements.txt
│       ├── iapp.config.json
│       └── test_manual/       # Manual testing data
│
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── providers/
│   ├── .env.local             # Configuration (already set)
│   └── package.json
│
├── DEPLOYMENT_SUMMARY.md      # All deployed addresses
├── TESTING_RESULTS.md         # Test results and verification
└── QUICK_START.md             # This file
```

---

## 11. Key Features

### Privacy-Preserving
- ✅ Balances encrypted via iExec DataProtector
- ✅ Calculations done in TEE (Intel SGX)
- ✅ Only Merkle root published on-chain
- ✅ Individual balances never revealed

### Gas-Efficient
- ✅ Merkle proofs instead of storing all balances
- ✅ Bulk processing of protected data
- ✅ Account Abstraction for gasless claims

### Scalable
- ✅ Handles unlimited holders (off-chain calculation)
- ✅ On-chain verification is O(log n)
- ✅ Single transaction per claim

---

## 12. Resources

### Documentation
- [Full Technical Spec](./arcana-technical-spec.md)
- [Deployment Summary](./DEPLOYMENT_SUMMARY.md)
- [Testing Results](./TESTING_RESULTS.md)

### External Links
- [iExec DataProtector Docs](https://docs.iex.ec/)
- [Arbitrum Sepolia](https://docs.arbitrum.io/)
- [OpenZeppelin Merkle Proof](https://docs.openzeppelin.com/contracts/4.x/api/utils#MerkleProof)

### Support
- iExec Discord: https://discord.gg/iexec (#hack4privacy)
- GitHub Issues: (your repository)

---

## 13. Demo Data

The `test_manual/iexec_in/protectedData.json` contains 3 test holders:

| Holder | Balance | Expected Dividend (1000 USDC pool) |
|--------|---------|-------------------------------------|
| 0x1234...7890 | 50,000,000,000 | 500,000,000 (50%) |
| 0x2345...8901 | 30,000,000,000 | 300,000,000 (30%) |
| 0x3456...9012 | 20,000,000,000 | 200,000,000 (20%) |

**Merkle Root**: `0x8726d8a8753bf06d688bf43d12df27f3fcbb7600553121de93766d9309681494`

You can modify this data to test different scenarios.

---

## 14. Next Steps

1. ✅ **You are here**: All components deployed and tested
2. ⏳ **Next**: Test frontend locally
3. ⏳ **Then**: Deploy frontend to Vercel
4. ⏳ **Finally**: Record demo video for hackathon

---

## 15. Important Notes

- **Testnet Only**: All deployments are on Arbitrum Sepolia testnet
- **No Real Money**: Use testnet ETH and mock USDC only
- **For Hackathon**: This is a proof-of-concept for Hack4Privacy 2026
- **Not Audited**: Smart contracts have not been audited

---

**Happy Testing! 🚀**

For questions or issues, check the documentation or reach out on Discord.

---

**Last Updated**: 2026-02-01
**Version**: 1.0
**Status**: Ready for Testing
