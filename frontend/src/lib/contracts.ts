// Smart Contract Addresses - Arbitrum Sepolia
// Deployed on 2026-01-30

export const CONTRACTS = {
  // Treasury Token (simulates tokenized treasury fund like BUIDL)
  arckanaToken: '0xaF7B67b88128820Fae205A07aDC055ed509Bdb12' as `0x${string}`,
  
  // Payment Token (for dividend distributions - simulates USDC)
  paymentToken: '0x71E3a04c9Ecc624656334756f70dAAA1fc4F985D' as `0x${string}`,
  
  // Dividend Distribution Pool (Merkle proof-based claims)
  dividendPool: '0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217' as `0x${string}`,
  
  // ERC-4337 Paymaster (gas sponsorship for claims)
  paymaster: '0x648B7FfD8a5Dd9C901B6569E7a0DC9A2eAF4c9F1' as `0x${string}`,
  
  // EntryPoint v0.7 (ERC-4337)
  entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37dA032' as `0x${string}`,
} as const;

// iExec iApp Address (TEE application for confidential dividend calculation)
// Note: Deployment pending due to iExec TEE transformation service issue
// Will be updated once iApp is successfully deployed
export const IAPP_ADDRESS = process.env.NEXT_PUBLIC_IAPP_ADDRESS as `0x${string}` | undefined;

// Network Configuration
export const NETWORK = {
  chainId: 421614, // Arbitrum Sepolia
  name: 'Arbitrum Sepolia',
  rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
  blockExplorer: 'https://sepolia.arbiscan.io',
} as const;

// Contract Explorer Links
export const getExplorerLink = (address: string, type: 'address' | 'tx' = 'address') => {
  return `${NETWORK.blockExplorer}/${type}/${address}`;
};

// Deployed Contracts Explorer Links
export const EXPLORER_LINKS = {
  arckanaToken: getExplorerLink(CONTRACTS.arckanaToken),
  paymentToken: getExplorerLink(CONTRACTS.paymentToken),
  dividendPool: getExplorerLink(CONTRACTS.dividendPool),
  paymaster: getExplorerLink(CONTRACTS.paymaster),
  entryPoint: getExplorerLink(CONTRACTS.entryPoint),
} as const;
