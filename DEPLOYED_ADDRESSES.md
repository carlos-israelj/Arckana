# Deployed Contract Addresses

## Arbitrum Sepolia Testnet

Deployed on: 2026-01-30

### Smart Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| **ArckanaToken** | [`0xaF7B67b88128820Fae205A07aDC055ed509Bdb12`](https://sepolia.arbiscan.io/address/0xaF7B67b88128820Fae205A07aDC055ed509Bdb12) | Treasury Token (simulates tokenized fund like BUIDL) |
| **PaymentToken** | [`0x71E3a04c9Ecc624656334756f70dAAA1fc4F985D`](https://sepolia.arbiscan.io/address/0x71E3a04c9Ecc624656334756f70dAAA1fc4F985D) | Dividend Payment Token (simulates USDC) |
| **DividendPool** | [`0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217`](https://sepolia.arbiscan.io/address/0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217) | Merkle-proof based dividend distribution |
| **ArckanaPaymaster** | [`0x648B7FfD8a5Dd9C901B6569E7a0DC9A2eAF4c9F1`](https://sepolia.arbiscan.io/address/0x648B7FfD8a5Dd9C901B6569E7a0DC9A2eAF4c9F1) | ERC-4337 Paymaster (gas sponsorship) |
| **EntryPoint v0.7** | [`0x0000000071727De22E5E9d8Baf0edAc6f37dA032`](https://sepolia.arbiscan.io/address/0x0000000071727De22E5E9d8Baf0edAc6f37dA032) | ERC-4337 Entry Point |

### iExec iApp

| Component | Status | Notes |
|-----------|--------|-------|
| **iApp Code** | ✅ Complete | Dividend calculator with Merkle tree generation |
| **Docker Image** | ✅ Published | `carlosisraelj/arckana-dividend-calculator:2` on Docker Hub |
| **TEE Transformation** | ⏳ Pending | iExec service experiencing temporary issues |
| **On-chain Deployment** | ⏳ Pending | Waiting for TEE transformation to complete |

### Network Details

- **Network**: Arbitrum Sepolia Testnet
- **Chain ID**: 421614
- **RPC URL**: https://sepolia-rollup.arbitrum.io/rpc
- **Block Explorer**: https://sepolia.arbiscan.io/
- **iExec Explorer**: https://explorer.iex.ec/arbitrum-sepolia-testnet

### Deployer Wallet

**Address**: [`0x648a3e5510f55B4995fA5A22cCD62e2586ACb901`](https://sepolia.arbiscan.io/address/0x648a3e5510f55B4995fA5A22cCD62e2586ACb901)

### Usage Instructions

#### For Frontend Development

Add these to your `frontend/.env.local`:

```env
NEXT_PUBLIC_ARCANA_TOKEN_ADDRESS=0xaF7B67b88128820Fae205A07aDC055ed509Bdb12
NEXT_PUBLIC_DIVIDEND_POOL_ADDRESS=0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217
NEXT_PUBLIC_PAYMASTER_ADDRESS=0x648B7FfD8a5Dd9C901B6569E7a0DC9A2eAF4c9F1
NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=0x71E3a04c9Ecc624656334756f70dAAA1fc4F985D
NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_IEXEC_CHAIN_ID=421614
```

#### To Complete iApp Deployment

When iExec service is available, run:

```bash
cd iapp
iapp deploy --chain arbitrum-sepolia-testnet
```

Then update `NEXT_PUBLIC_IAPP_ADDRESS` in `.env.local`

### Notes

- ✅ All core smart contracts deployed successfully
- ✅ Paymaster deployed (needs ETH funding for gas sponsorship)
- ⏳ iApp deployment pending due to temporary iExec TEE service issue
- 📝 Frontend configured with all deployed contract addresses
