'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACTS, ARCKANA_TOKEN_ABI } from '@/lib/contracts';

export default function TokenFaucet() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('10000');
  const [isMinting, setIsMinting] = useState(false);

  const {
    writeContract: writeMint,
    data: mintHash,
    isPending: isMintPending,
    error: mintError
  } = useWriteContract();

  const { isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  const handleMint = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setIsMinting(true);
      const amountWei = parseUnits(amount, 6); // ARCK has 6 decimals

      writeMint({
        address: CONTRACTS.arckanaToken,
        abi: ARCKANA_TOKEN_ABI,
        functionName: 'mint',
        args: [address, amountWei],
        // Let wagmi/viem automatically estimate gas prices from the network
        // This prevents "max fee per gas less than block base fee" errors
      });
    } catch (error) {
      console.error('Error minting tokens:', error);
      alert('Error requesting tokens. Check console for details.');
      setIsMinting(false);
    }
  };

  // Reset minting state when transaction completes
  if (isMintSuccess && isMinting) {
    setIsMinting(false);
  }

  if (!isConnected) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-2 text-yellow-400">💰 Get Test Tokens</h3>
        <p className="text-gray-400">
          Connect your wallet to request ARCK test tokens
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">💰 ARCK Token Faucet</h3>
        <p className="text-gray-400 text-sm">
          Request test ARCK tokens to participate in dividend distribution
        </p>
      </div>

      {/* Token Info */}
      <div className="bg-black/20 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Token Name</p>
            <p className="text-white font-medium">Arckana Token</p>
          </div>
          <div>
            <p className="text-gray-500">Symbol</p>
            <p className="text-white font-medium">ARCK</p>
          </div>
          <div>
            <p className="text-gray-500">Network</p>
            <p className="text-white font-medium">Arbitrum Sepolia</p>
          </div>
          <div>
            <p className="text-gray-500">Decimals</p>
            <p className="text-white font-medium">6</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-gray-500 text-xs">Contract Address</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-white font-mono text-xs break-all">
              {CONTRACTS.arckanaToken}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(CONTRACTS.arckanaToken)}
              className="text-blue-400 hover:text-blue-300 text-xs"
              title="Copy address"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Amount to Request (ARCK)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount (e.g., 10000)"
          className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-gray-500 text-xs mt-1">
          Suggested amounts: 10,000 / 50,000 / 100,000 ARCK
        </p>
      </div>

      {/* Quick Amount Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setAmount('10000')}
          className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded text-sm transition"
        >
          10K
        </button>
        <button
          onClick={() => setAmount('50000')}
          className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded text-sm transition"
        >
          50K
        </button>
        <button
          onClick={() => setAmount('100000')}
          className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded text-sm transition"
        >
          100K
        </button>
      </div>

      {/* Request Button */}
      <button
        onClick={handleMint}
        disabled={isMintPending || isMinting || !amount}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition"
      >
        {isMintPending || isMinting ? 'Requesting Tokens...' : '🎁 Request ARCK Tokens'}
      </button>

      {/* Success Message */}
      {isMintSuccess && (
        <div className="mt-4 bg-green-900/30 border border-green-500/50 rounded-lg p-4">
          <p className="text-green-400 font-medium">✓ Tokens Received!</p>
          <p className="text-gray-400 text-sm mt-1">
            {amount} ARCK tokens have been sent to your wallet
          </p>
          <a
            href={`https://sepolia.arbiscan.io/tx/${mintHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 text-sm hover:underline mt-2 inline-block"
          >
            View on Arbiscan →
          </a>
        </div>
      )}

      {/* Error Message */}
      {mintError && (
        <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 font-medium">⚠ Error Requesting Tokens</p>
          <p className="text-gray-400 text-sm mt-1">
            {mintError.message || 'Failed to mint tokens. Please try again.'}
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="font-medium text-blue-300 mb-2 text-sm">ℹ️ About Test Tokens</h4>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• These are testnet tokens with no real value</li>
          <li>• Use them to test the dividend distribution system</li>
          <li>• You can request tokens multiple times</li>
          <li>• Tokens represent your share in dividend calculations</li>
        </ul>
      </div>

      {/* Add to Wallet Button */}
      <button
        onClick={async () => {
          try {
            // Try to get ethereum provider from window
            const ethereum = (window as any).ethereum;

            if (!ethereum) {
              alert(
                '⚠️ No wallet detected\n\n' +
                'Please install a Web3 wallet like MetaMask.\n\n' +
                'Or add the token manually:\n' +
                `Address: ${CONTRACTS.arckanaToken}\n` +
                'Symbol: ARCK\n' +
                'Decimals: 6'
              );
              return;
            }

            // Detect wallet type
            const isRabby = ethereum.isRabby;
            const isMetaMask = ethereum.isMetaMask;
            const isCoinbaseWallet = ethereum.isCoinbaseWallet;

            // For wallets that don't support wallet_watchAsset, show manual instructions
            if (isRabby || (!isMetaMask && !isCoinbaseWallet)) {
              const walletName = isRabby ? 'Rabby' : 'your wallet';
              alert(
                `⚠️ ${walletName} - Add Token Manually\n\n` +
                'Please add the token manually in your wallet:\n\n' +
                `Address: ${CONTRACTS.arckanaToken}\n` +
                'Symbol: ARCK\n' +
                'Decimals: 6\n\n' +
                '1. Open your wallet\n' +
                '2. Go to: Assets → Add Custom Token\n' +
                '3. Paste the address above'
              );
              // Copy address to clipboard for convenience
              try {
                await navigator.clipboard.writeText(CONTRACTS.arckanaToken);
                alert('✅ Contract address copied to clipboard!');
              } catch (e) {
                // Clipboard API might fail, that's ok
              }
              return;
            }

            // For MetaMask and compatible wallets, try wallet_watchAsset
            const result = await ethereum.request({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC20',
                options: {
                  address: CONTRACTS.arckanaToken,
                  symbol: 'ARCK',
                  decimals: 6,
                },
              },
            });

            if (result) {
              alert('✅ ARCK token added to your wallet!');
            }
          } catch (error: any) {
            console.error('Error adding token to wallet:', error);

            // User rejected
            if (error.code === 4001) {
              alert('Token addition was cancelled.');
              return;
            }

            // Method not supported or other error
            alert(
              '⚠️ Could not add token automatically\n\n' +
              'Please add it manually in your wallet:\n\n' +
              `Address: ${CONTRACTS.arckanaToken}\n` +
              'Symbol: ARCK\n' +
              'Decimals: 6\n\n' +
              'Steps:\n' +
              '1. Open your wallet\n' +
              '2. Go to Assets/Tokens\n' +
              '3. Click "Add Custom Token"\n' +
              '4. Paste the address above'
            );

            // Try to copy to clipboard
            try {
              await navigator.clipboard.writeText(CONTRACTS.arckanaToken);
              alert('✅ Contract address copied to clipboard!');
            } catch (e) {
              // Clipboard API might fail, that's ok
            }
          }
        }}
        className="w-full mt-4 bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm transition"
      >
        ➕ Add ARCK to Wallet
      </button>
    </div>
  );
}
