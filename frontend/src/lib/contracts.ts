// Smart Contract Addresses - Arbitrum Sepolia
// Deployed on 2026-02-06

export const CONTRACTS = {
  // Treasury Token (simulates tokenized treasury fund like BUIDL)
  arckanaToken: '0x97158e24465C30D09557e1853460c74D3ee00F5E' as `0x${string}`,

  // Payment Token (for dividend distributions - simulates USDC)
  paymentToken: '0xaDD672721dff93448A5701F0a55EcDb7cA512d1A' as `0x${string}`,

  // Dividend Distribution Pool (Merkle proof-based claims)
  dividendPool: '0x51FEb9273B01d96C3cff5Ded91521248AaAc587B' as `0x${string}`,

  // ERC-4337 Paymaster (gas sponsorship for claims)
  paymaster: '0xa3A7C33C21c6B347B220B174928609A7Ae74BD10' as `0x${string}`,
  
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

// Export contract addresses for backwards compatibility
export const DIVIDEND_POOL_ADDRESS = CONTRACTS.dividendPool;

// PaymentToken ABI (ERC20)
export const PAYMENT_TOKEN_ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false }
    ]
  }
] as const;

// ArckanaToken ABI (ERC20 with mint function)
export const ARCKANA_TOKEN_ABI = [
  {
    type: 'function',
    name: 'mint',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view'
  }
] as const;

// DividendPool ABI
export const DIVIDEND_POOL_ABI = [
  {
    type: 'function',
    name: 'claimDividend',
    inputs: [
      { name: 'round', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'merkleProof', type: 'bytes32[]' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'startDistributionRound',
    inputs: [
      { name: 'merkleRoot', type: 'bytes32' },
      { name: 'totalPool', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'currentRound',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getRoundInfo',
    inputs: [{ name: 'round', type: 'uint256' }],
    outputs: [
      { name: 'root', type: 'bytes32' },
      { name: 'total', type: 'uint256' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'hasClaimed',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'address' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'canClaim',
    inputs: [
      { name: 'round', type: 'uint256' },
      { name: 'holder', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'merkleProof', type: 'bytes32[]' }
    ],
    outputs: [{ name: 'valid', type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'event',
    name: 'DividendClaimed',
    inputs: [
      { name: 'round', type: 'uint256', indexed: true },
      { name: 'holder', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'RoundStarted',
    inputs: [
      { name: 'round', type: 'uint256', indexed: true },
      { name: 'merkleRoot', type: 'bytes32', indexed: false },
      { name: 'totalPool', type: 'uint256', indexed: false }
    ]
  }
] as const;
