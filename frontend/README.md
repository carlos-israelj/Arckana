# Arckana Frontend

Confidential dividend distribution interface for tokenized treasury funds powered by iExec and Arbitrum.

## Features

- 🔐 **Confidential Balance Protection** - Encrypt holder balances with iExec DataProtector
- 🧮 **TEE-based Dividend Calculation** - Secure computation in Intel SGX/TDX environment
- 🌳 **Merkle Proof Claims** - Gasless dividend claims with zero-knowledge proofs
- 💳 **Account Abstraction** - Optional gas sponsorship via ERC-4337 Paymaster
- 🎨 **Modern UI** - Built with Next.js 14, RainbowKit, and Tailwind CSS

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your values:

```env
# Get from https://cloud.walletconnect.com/app
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Contract addresses (already configured for Arbitrum Sepolia)
NEXT_PUBLIC_ARCANA_TOKEN_ADDRESS=0xaF7B67b88128820Fae205A07aDC055ed509Bdb12
NEXT_PUBLIC_DIVIDEND_POOL_ADDRESS=0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217
NEXT_PUBLIC_PAYMASTER_ADDRESS=0x648B7FfD8a5Dd9C901B6569E7a0DC9A2eAF4c9F1
NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=0x71E3a04c9Ecc624656334756f70dAAA1fc4F985D

# iApp address (update when deployed)
NEXT_PUBLIC_IAPP_ADDRESS=0x...

# Network config (pre-configured)
NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_IEXEC_CHAIN_ID=421614
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   ├── ConnectWallet.tsx     # Wallet connection
│   │   ├── ProtectBalance.tsx    # DataProtector integration
│   │   ├── RunDividendCalc.tsx   # iApp execution
│   │   └── ClaimDividend.tsx     # Merkle proof claims
│   ├── hooks/            # Custom React hooks
│   │   └── useDataProtector.ts   # iExec DataProtector hooks
│   ├── lib/              # Utilities and config
│   │   ├── contracts.ts          # Contract addresses
│   │   └── iexec-config.ts       # iExec configuration
│   └── providers/        # Context providers
│       └── Web3Provider.tsx      # Wagmi + RainbowKit setup
├── public/               # Static assets
└── .env.local.example    # Environment template
```

## User Flow

### For Token Holders

1. **Connect Wallet** - Use RainbowKit to connect your wallet
2. **Protect Balance** - Encrypt your token balance using iExec DataProtector
3. **Wait for Distribution** - Operator runs dividend calculation in TEE
4. **Claim Dividends** - Use Merkle proof to claim your share

### For Operators

1. **Collect Protected Data** - Gather encrypted balances from all holders
2. **Run Calculation** - Execute iApp with total dividend pool amount
3. **Publish Merkle Root** - Start distribution round with calculated root
4. **Monitor Claims** - Track dividend claims on-chain

## Key Technologies

- **Next.js 14** - React framework with App Router
- **RainbowKit** - Wallet connection UI
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript Ethereum library
- **iExec DataProtector** - Confidential data encryption
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first styling

## Smart Contracts (Arbitrum Sepolia)

| Contract | Address |
|----------|---------|
| ArckanaToken | `0xaF7B67b88128820Fae205A07aDC055ed509Bdb12` |
| PaymentToken | `0x71E3a04c9Ecc624656334756f70dAAA1fc4F985D` |
| DividendPool | `0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217` |
| ArckanaPaymaster | `0x648B7FfD8a5Dd9C901B6569E7a0DC9A2eAF4c9F1` |

See [DEPLOYED_ADDRESSES.md](../DEPLOYED_ADDRESSES.md) for full details.

## Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

See [VERCEL_DEPLOYMENT.md](../VERCEL_DEPLOYMENT.md) for deployment instructions.

## Learn More

- [iExec Documentation](https://docs.iex.ec/)
- [DataProtector SDK](https://tools.docs.iex.ec/tools/dataprotector)
- [Next.js Documentation](https://nextjs.org/docs)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs/introduction)
- [Wagmi Documentation](https://wagmi.sh/)

## License

MIT
