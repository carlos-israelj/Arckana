# Arckana - Deployment Summary

## Hackathon Information
- **Event**: iExec Hack4Privacy 2026
- **Track**: Confidential RWA + Bulk Processing + Account Abstraction
- **Deployment Date**: 2026-02-01
- **Status**: ✅ All Components Deployed

---

## Deployed Smart Contracts (Arbitrum Sepolia)

### Network Configuration
- **Chain**: Arbitrum Sepolia Testnet
- **Chain ID**: 421614
- **RPC URL**: https://sepolia-rollup.arbitrum.io/rpc
- **Block Explorer**: https://sepolia.arbiscan.io/

### Contract Addresses

#### 1. ArckanaToken (ERC20)
- **Address**: `0xaF7B67b88128820Fae205A07aDC055ed509Bdb12`
- **Explorer**: https://sepolia.arbiscan.io/address/0xaF7B67b88128820Fae205A07aDC055ed509Bdb12
- **Purpose**: Tokenized treasury fund (RWA)
- **Features**: Standard ERC20 token

#### 2. DividendPool
- **Address**: `0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217`
- **Explorer**: https://sepolia.arbiscan.io/address/0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217
- **Purpose**: Confidential dividend distribution with Merkle proofs
- **Features**:
  - Merkle tree-based verification
  - Multi-round distribution
  - Protection against double claiming
  - Integration with iExec for privacy

#### 3. ArckanaPaymaster (ERC-4337)
- **Address**: `0x648B7FfD8a5Dd9C901B6569E7a0DC9A2eAF4c9F1`
- **Explorer**: https://sepolia.arbiscan.io/address/0x648B7FfD8a5Dd9C901B6569E7a0DC9A2eAF4c9F1
- **Purpose**: Gasless dividend claims via Account Abstraction
- **Features**:
  - Sponsors gas fees for dividend claims
  - Validates merkle proofs before sponsorship
  - Configurable deposit management

#### 4. PaymentToken (Mock USDC)
- **Address**: `0x71E3a04c9Ecc624656334756f70dAAA1fc4F985D`
- **Explorer**: https://sepolia.arbiscan.io/address/0x71E3a04c9Ecc624656334756f70dAAA1fc4F985D
- **Purpose**: Payment token for dividend distribution
- **Features**: ERC20 with 6 decimals (USDC compatible)

---

## iExec iApp Deployment

### iApp Information
- **iApp Address**: `0x4dF342F232BD89705090c00081924555E849FDb5`
- **TEE Image**: `carlosisraelj/arckana-dividend-calculator:0.0.1-tee-scone-5.9.1-v16-prod-239a4a71c09d`
- **Docker Hub**: https://hub.docker.com/r/carlosisraelj/arckana-dividend-calculator
- **TEE Technology**: Intel SGX (SCONE framework)
- **Chain**: Arbitrum Sepolia Testnet

### iApp Configuration
- **Project Name**: arckana-dividend-calculator
- **Template**: Python 3.13
- **Deployment Wallet**: `0x648a3e5510f55B4995fA5A22cCD62e2586ACb901`
- **Docker Hub Username**: carlosisraelj

### iApp Capabilities
- ✅ Confidential balance processing (bulk mode)
- ✅ Dividend calculation with proportional distribution
- ✅ Merkle tree generation (Solidity-compatible)
- ✅ Merkle proof generation for each holder
- ✅ Dust distribution to largest holder
- ✅ Output in iExec-compatible format

---

## Wallet Configuration

### Deployment Wallet
- **Address**: `0x648a3e5510f55B4995fA5A22cCD62e2586ACb901`
- **Private Key**: `0x86025bec599bee8a7302c836abb73aadbedd2df0d7f771b7f850efd65294ea03`
- **Purpose**:
  - Smart contract deployment
  - iApp deployment and execution
  - Operator role in DividendPool

### Docker Hub Credentials
- **Username**: carlosisraelj
- **Access Token**: `[REDACTED - Set as environment variable]`

---

## Frontend Configuration

### Environment Variables (`.env.local`)
```env
# Wallet Connection
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Smart Contracts (Arbitrum Sepolia)
NEXT_PUBLIC_ARCANA_TOKEN_ADDRESS=0xaF7B67b88128820Fae205A07aDC055ed509Bdb12
NEXT_PUBLIC_DIVIDEND_POOL_ADDRESS=0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217
NEXT_PUBLIC_PAYMASTER_ADDRESS=0x648B7FfD8a5Dd9C901B6569E7a0DC9A2eAF4c9F1
NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=0x71E3a04c9Ecc624656334756f70dAAA1fc4F985D

# iExec Configuration
NEXT_PUBLIC_IAPP_ADDRESS=0x4dF342F232BD89705090c00081924555E849FDb5

# Network Configuration
NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_IEXEC_CHAIN_ID=421614
```

### Frontend Stack
- **Framework**: Next.js 14.1.0
- **Wallet Integration**: RainbowKit 2.0 + Wagmi 2.5
- **iExec Integration**: @iexec/dataprotector 2.0.0-beta.23
- **Styling**: Tailwind CSS 3.4

---

## Project Structure

```
Arcana/
├── contracts/                    # Foundry smart contracts
│   ├── src/
│   │   ├── ArckanaToken.sol
│   │   ├── DividendPool.sol
│   │   ├── ArckanaPaymaster.sol
│   │   └── PaymentToken.sol
│   └── test/
│
├── iapp/
│   └── arckana-dividend-calculator/  # iExec confidential app
│       ├── src/
│       │   └── app.py              # Main dividend calculator
│       ├── Dockerfile
│       ├── requirements.txt
│       └── iapp.config.json
│
└── frontend/                     # Next.js frontend
    ├── src/
    │   ├── components/
    │   │   ├── ProtectBalance.tsx
    │   │   ├── DistributionStatus.tsx
    │   │   └── ClaimDividend.tsx
    │   ├── hooks/
    │   ├── lib/
    │   └── providers/
    └── package.json
```

---

## Testing & Verification

### Smart Contracts
- ✅ Compiled with Foundry
- ✅ Deployed to Arbitrum Sepolia
- ✅ Addresses verified on Arbiscan
- ⏳ Unit tests (pending)
- ⏳ Integration tests (pending)

### iApp
- ✅ Docker image built successfully
- ✅ Local testing passed
- ✅ Pushed to Docker Hub
- ✅ TEE transformation completed
- ✅ Deployed to iExec network
- ⏳ Live execution test (pending)

### Frontend
- ✅ Dependencies installed
- ✅ Environment variables configured
- ✅ Components implemented
- ⏳ Local dev server test (pending)
- ⏳ End-to-end flow test (pending)

---

## How to Use

### For Token Holders (Frontend)

1. **Protect Your Balance**
   - Connect wallet with RainbowKit
   - Click "Protect My Balance"
   - Data encrypted via iExec DataProtector

2. **Wait for Distribution**
   - Operator runs dividend calculation in TEE
   - Merkle root published on-chain
   - Distribution round starts

3. **Claim Your Dividend**
   - View your entitled amount
   - Click "Claim Dividend"
   - Gas fees sponsored by Paymaster (if eligible)
   - Receive USDC to your wallet

### For Operators (Backend)

1. **Trigger Dividend Calculation**
   ```bash
   # Execute iApp with protected data
   iapp run 0x4dF342F232BD89705090c00081924555E849FDb5 \
     --chain arbitrum-sepolia-testnet \
     --args "1000000000"
   ```

2. **Publish Merkle Root**
   ```solidity
   dividendPool.startDistributionRound(merkleRoot, totalPool);
   ```

3. **Monitor Claims**
   - Track claim events on-chain
   - Ensure Paymaster has sufficient deposit

---

## Next Steps

### Immediate (Testing)
- [ ] Test iApp execution with sample protected data
- [ ] Run frontend locally and verify wallet connection
- [ ] Test end-to-end flow: protect → calculate → claim

### Short-term (Polish)
- [ ] Add comprehensive error handling
- [ ] Implement loading states in UI
- [ ] Add transaction notifications
- [ ] Write unit tests for smart contracts
- [ ] Create demo video

### Medium-term (Enhancement)
- [ ] Deploy frontend to Vercel
- [ ] Set up monitoring and analytics
- [ ] Add admin dashboard for operators
- [ ] Implement batch claim optimization
- [ ] Add support for multiple payment tokens

### Long-term (Production)
- [ ] Security audit for smart contracts
- [ ] Mainnet deployment planning
- [ ] Integration with real RWA protocols
- [ ] Multi-chain support
- [ ] DAO governance for parameters

---

## Resources

### Documentation
- [iExec DataProtector](https://docs.iex.ec/for-developers/confidential-computing/create-your-first-secret)
- [Arbitrum Sepolia](https://docs.arbitrum.io/for-devs/dev-tools-and-resources/public-chains)
- [ERC-4337 Account Abstraction](https://eips.ethereum.org/EIPS/eip-4337)

### Explorers
- [Arbiscan Sepolia](https://sepolia.arbiscan.io/)
- [iExec Explorer](https://explorer.iex.ec/)
- [Docker Hub](https://hub.docker.com/r/carlosisraelj/arckana-dividend-calculator)

### Support
- [iExec Discord](https://discord.gg/iexec) - #hack4privacy
- [GitHub Repository](https://github.com/carlos-israelj/Arckana)

---

## Troubleshooting

### Common Issues

1. **"Failed to transform your app into a TEE app"**
   - Solution: Use official `iapp init` template
   - See: `REINIT_IAPP_GUIDE.md`

2. **Frontend not connecting to wallet**
   - Check WalletConnect Project ID
   - Verify network matches Arbitrum Sepolia (421614)

3. **Claims not being sponsored**
   - Ensure Paymaster has ETH deposit
   - Verify merkle proof is valid

4. **Protected data not accessible**
   - Check DataProtector permissions
   - Verify iApp has access to protected data

---

## Deployment Timeline

| Date | Milestone |
|------|-----------|
| 2026-01-30 | Smart contracts deployed |
| 2026-02-01 | iApp deployment attempts (various fixes) |
| 2026-02-01 | iApp successfully deployed with official template |
| 2026-02-01 | Frontend configuration completed |
| 2026-02-01 | Ready for end-to-end testing |

---

## Team

**Arckana Team**
- Developer: Carlos Israel Jiménez
- Hackathon: iExec Hack4Privacy 2026
- Track: Confidential RWA + Bulk Processing + Account Abstraction

---

**Last Updated**: 2026-02-01 22:30 UTC
