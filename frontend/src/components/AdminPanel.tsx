'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACTS, DIVIDEND_POOL_ABI } from '@/lib/contracts';

// Admin wallet address from environment variable
const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS as string || '';

export default function AdminPanel() {
  const { address } = useAccount();
  const [totalPool, setTotalPool] = useState('');
  const [merkleRoot, setMerkleRoot] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { writeContract, isPending, isSuccess } = useWriteContract();

  // Read current round
  const { data: currentRound } = useReadContract({
    address: CONTRACTS.dividendPool,
    abi: DIVIDEND_POOL_ABI,
    functionName: 'currentRound',
  });

  // Check if user is admin
  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  const handleStartDistribution = async () => {
    if (!totalPool || !merkleRoot) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsProcessing(true);

      // Convert amount to wei (6 decimals for USDC)
      const amountWei = parseUnits(totalPool, 6);

      // TODO: First approve PaymentToken
      // This should be done in a separate step or automatically

      // Start distribution round
      writeContract({
        address: CONTRACTS.dividendPool,
        abi: DIVIDEND_POOL_ABI,
        functionName: 'startDistributionRound',
        args: [merkleRoot as `0x${string}`, amountWei],
      });

    } catch (error) {
      console.error('Error starting distribution:', error);
      alert('Error starting distribution. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunIApp = async () => {
    setIsProcessing(true);

    try {
      // TODO: Integrate with DataProtector to run iApp
      // For now, show instructions
      alert(
        'iApp Execution:\n\n' +
        '1. The iApp will fetch all protected balances\n' +
        '2. Calculate dividends in TEE\n' +
        '3. Generate Merkle tree\n' +
        '4. Return Merkle root\n\n' +
        'For now, use pre-computed root from test:\n' +
        '0x8726d8a8753bf06d688bf43d12df27f3fcbb7600553121de93766d9309681494'
      );

      // Set the test Merkle root
      setMerkleRoot('0x8726d8a8753bf06d688bf43d12df27f3fcbb7600553121de93766d9309681494');

    } catch (error) {
      console.error('Error running iApp:', error);
      alert('Error running iApp. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-2 text-red-400">⚠️ Admin Access Required</h3>
        <p className="text-gray-400">
          This panel is only accessible to the admin wallet.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Your address: {address}
        </p>
        <p className="text-gray-500 text-sm">
          Admin address: {ADMIN_ADDRESS}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold mb-2">🔧 Admin Panel</h3>
        <p className="text-gray-400 text-sm">
          Manage dividend distributions and run iApp calculations
        </p>
      </div>

      {/* Current Status */}
      <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">📊 Current Status</h4>
        <div className="space-y-1 text-sm">
          <p className="text-gray-400">
            Current Round: <span className="text-white font-mono">{currentRound?.toString() || '0'}</span>
          </p>
          <p className="text-gray-400">
            Next Round: <span className="text-white font-mono">{currentRound ? (Number(currentRound) + 1).toString() : '1'}</span>
          </p>
        </div>
      </div>

      {/* Step 1: Run iApp */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Step 1: Calculate Dividends</h4>
          <p className="text-gray-400 text-sm mb-4">
            Run the iApp in TEE to process all protected balances and generate the Merkle tree.
          </p>

          <button
            onClick={handleRunIApp}
            disabled={isProcessing}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition"
          >
            {isProcessing ? 'Processing...' : '⚙️ Run iApp Calculation'}
          </button>

          <p className="text-gray-500 text-xs mt-2">
            This will fetch all granted balances and calculate dividends confidentially
          </p>
        </div>

        {/* Merkle Root Output */}
        {merkleRoot && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400 font-medium mb-2">✓ Merkle Root Generated</p>
            <p className="text-gray-300 text-sm font-mono break-all">
              {merkleRoot}
            </p>
          </div>
        )}
      </div>

      {/* Step 2: Start Distribution */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Step 2: Start Distribution Round</h4>
          <p className="text-gray-400 text-sm mb-4">
            Publish the Merkle root and total pool amount to the blockchain.
          </p>
        </div>

        {/* Total Pool Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Total Distribution Pool (USDC)
          </label>
          <input
            type="number"
            value={totalPool}
            onChange={(e) => setTotalPool(e.target.value)}
            placeholder="Enter amount (e.g., 1000)"
            className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-500 text-xs mt-1">
            Total USDC to distribute across all holders
          </p>
        </div>

        {/* Merkle Root Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Merkle Root
          </label>
          <input
            type="text"
            value={merkleRoot}
            onChange={(e) => setMerkleRoot(e.target.value)}
            placeholder="0x..."
            className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <p className="text-gray-500 text-xs mt-1">
            Generated from iApp calculation (Step 1)
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleStartDistribution}
          disabled={!totalPool || !merkleRoot || isPending || isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition"
        >
          {isPending ? 'Confirming Transaction...' : '📤 Start Distribution Round'}
        </button>

        {isSuccess && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400 font-medium">✓ Distribution Started!</p>
            <p className="text-gray-400 text-sm mt-1">
              Token holders can now claim their dividends.
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <h4 className="font-medium mb-2">📋 Instructions</h4>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
          <li>Make sure you have approved PaymentToken for DividendPool</li>
          <li>Run the iApp calculation to get the Merkle root</li>
          <li>Enter the total pool amount you want to distribute</li>
          <li>Paste the Merkle root from the iApp result</li>
          <li>Click "Start Distribution Round" and confirm in your wallet</li>
          <li>Token holders will be able to claim their dividends</li>
        </ol>
      </div>

      {/* Warning */}
      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
        <p className="text-yellow-400 font-medium mb-2">⚠️ Important</p>
        <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
          <li>Ensure you have sufficient PaymentToken balance</li>
          <li>Approve the DividendPool contract first</li>
          <li>Verify the Merkle root is correct before publishing</li>
          <li>This action cannot be undone</li>
        </ul>
      </div>
    </div>
  );
}
