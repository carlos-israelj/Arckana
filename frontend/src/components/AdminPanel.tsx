'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACTS, DIVIDEND_POOL_ABI, PAYMENT_TOKEN_ABI, IAPP_ADDRESS } from '@/lib/contracts';
import { useDataProtector } from '@/hooks/useDataProtector';

// Admin wallet address from environment variable
const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS as string || '';

export default function AdminPanel() {
  const { address } = useAccount();
  const [totalPool, setTotalPool] = useState('');
  const [merkleRoot, setMerkleRoot] = useState('');
  const [approveAmount, setApproveAmount] = useState('');
  const [protectedDataAddresses, setProtectedDataAddresses] = useState('');
  const [iappStatus, setIappStatus] = useState<string>('');

  const { dataProtectorCore, isReady } = useDataProtector();

  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApproving
  } = useWriteContract();

  const {
    writeContract: writeDistribution,
    data: distributionHash,
    isPending: isDistributing
  } = useWriteContract();

  // Wait for approve transaction
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wait for distribution transaction
  const { isSuccess: isDistributionSuccess } = useWaitForTransactionReceipt({
    hash: distributionHash,
  });

  // Read current round
  const { data: currentRound } = useReadContract({
    address: CONTRACTS.dividendPool,
    abi: DIVIDEND_POOL_ABI,
    functionName: 'currentRound',
  });

  // Read USDC balance
  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.paymentToken,
    abi: PAYMENT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.paymentToken,
    abi: PAYMENT_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.dividendPool] : undefined,
  });

  // Refetch allowance after approval
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  // Check if user is admin
  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  const handleApprove = async () => {
    if (!approveAmount) {
      alert('Please enter amount to approve');
      return;
    }

    try {
      const amountWei = parseUnits(approveAmount, 6);

      writeApprove({
        address: CONTRACTS.paymentToken,
        abi: PAYMENT_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACTS.dividendPool, amountWei],
        maxFeePerGas: 100000000n,
        maxPriorityFeePerGas: 100000n,
      });
    } catch (error) {
      console.error('Error approving:', error);
      alert('Error approving. Check console for details.');
    }
  };

  const handleRunIApp = async () => {
    if (!IAPP_ADDRESS) {
      alert('iApp not deployed. Please set NEXT_PUBLIC_IAPP_ADDRESS.');
      return;
    }

    if (!totalPool) {
      alert('Please enter the total pool amount first.');
      return;
    }

    if (!protectedDataAddresses) {
      alert('Please enter Protected Data Addresses (comma-separated).');
      return;
    }

    if (!dataProtectorCore) {
      alert('DataProtector not initialized. Please connect your wallet.');
      return;
    }

    try {
      setIappStatus('Parsing protected data addresses...');

      // Parse comma-separated addresses
      const addressList = protectedDataAddresses
        .split(',')
        .map(addr => addr.trim())
        .filter(addr => addr.length > 0);

      if (addressList.length === 0) {
        alert('No valid protected data addresses found.');
        setIappStatus('');
        return;
      }

      console.log('Protected data addresses:', addressList);
      setIappStatus(`Found ${addressList.length} protected data items. Preparing execution...`);

      // Convert totalPool to base units (6 decimals for USDC)
      const totalPoolBaseUnits = parseUnits(totalPool, 6).toString();
      console.log('Total pool in base units:', totalPoolBaseUnits);

      setIappStatus('Executing iApp in TEE...');

      // Execute the iApp with protected data
      const result = await dataProtectorCore.processProtectedData({
        protectedData: addressList[0], // Process first one or array
        app: IAPP_ADDRESS,
        args: totalPoolBaseUnits, // Pass total pool amount in base units
        workerpool: '0xB967057a21dc6A66A29721d96b8Aa7454B7c383F', // Arbitrum Sepolia prod workerpool
        onStatusUpdate: ({ title, isDone }: { title: string; isDone: boolean }) => {
          setIappStatus(title);
          console.log(`iApp Status: ${title}, Done: ${isDone}`);
        },
      });

      console.log('iApp execution result:', result);

      setIappStatus('Fetching task result...');

      // Extract taskId from result
      const taskId = (result as any).taskId;
      console.log('Task ID:', taskId);

      // Wait a bit for the task to complete
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Try to fetch the result
      try {
        const taskResult = await dataProtectorCore.fetchResultFromTask({
          taskId: taskId,
        });

        console.log('Task result:', taskResult);

        // Extract merkle root from result
        if (taskResult && taskResult.result && taskResult.result.merkle_root) {
          const fetchedMerkleRoot = taskResult.result.merkle_root;
          setMerkleRoot(fetchedMerkleRoot);

          // Also save distribution data for claims
          if (taskResult.result.distribution) {
            localStorage.setItem('arckana-distribution', JSON.stringify(taskResult.result.distribution));
            console.log('Saved distribution data for claims');
          }

          alert(
            'iApp Execution Complete! ✅\n\n' +
            `Merkle Root: ${fetchedMerkleRoot}\n\n` +
            `Holders: ${taskResult.result.holder_count || 'N/A'}\n` +
            `Total Distributed: ${totalPool} USDC\n\n` +
            'The Merkle root has been set automatically.\n' +
            'You can now proceed to Step 2 to start the distribution round.'
          );
        } else {
          // Result not ready yet
          alert(
            'iApp Execution Started! ⏳\n\n' +
            `Task ID: ${taskId}\n\n` +
            'The task is still processing. Please:\n' +
            '1. Wait a few minutes for task completion\n' +
            '2. Check task results on iExec Explorer\n' +
            '3. The Merkle root will appear here automatically\n\n' +
            `Explorer: https://explorer.iex.ec/bellecour/task/${taskId}`
          );
        }
      } catch (fetchError) {
        console.log('Could not fetch result yet:', fetchError);
        alert(
          'iApp Execution Started! ⏳\n\n' +
          `Task ID: ${taskId}\n\n` +
          'The task is processing in the TEE.\n' +
          'Please wait a few minutes and check the iExec Explorer:\n\n' +
          `https://explorer.iex.ec/bellecour/task/${taskId}\n\n` +
          'Once complete, you can manually enter the Merkle root.'
        );
      }

      setIappStatus('');

    } catch (error: any) {
      console.error('Error running iApp:', error);
      alert(`Error running iApp: ${error.message || 'Unknown error'}\n\nCheck console for details.`);
      setIappStatus('');
    }
  };

  const handleStartDistribution = async () => {
    if (!totalPool || !merkleRoot) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const amountWei = parseUnits(totalPool, 6);

      // Check allowance
      if (allowance && allowance < amountWei) {
        alert(`Insufficient allowance. Please approve at least ${totalPool} USDC first.`);
        return;
      }

      // Start distribution round
      writeDistribution({
        address: CONTRACTS.dividendPool,
        abi: DIVIDEND_POOL_ABI,
        functionName: 'startDistributionRound',
        args: [merkleRoot as `0x${string}`, amountWei],
        maxFeePerGas: 100000000n,
        maxPriorityFeePerGas: 100000n,
      });

    } catch (error) {
      console.error('Error starting distribution:', error);
      alert('Error starting distribution. Check console for details.');
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
          Manage dividend distributions
        </p>
      </div>

      {/* Balance & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <h4 className="font-medium mb-2 text-sm">💰 Your USDC Balance</h4>
          <p className="text-2xl font-bold text-white">
            {usdcBalance ? formatUnits(usdcBalance, 6) : '0'}
          </p>
        </div>

        <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
          <h4 className="font-medium mb-2 text-sm">📊 Current Round</h4>
          <p className="text-2xl font-bold text-white">
            {currentRound?.toString() || '0'}
          </p>
        </div>
      </div>

      {/* Allowance Status */}
      <div className={`border rounded-lg p-4 ${
        allowance && allowance > 0n
          ? 'bg-green-900/30 border-green-500/50'
          : 'bg-yellow-900/30 border-yellow-500/50'
      }`}>
        <h4 className="font-medium mb-2">📝 Allowance Status</h4>
        <p className="text-sm text-gray-300">
          Current Allowance: <span className="font-mono text-white">
            {allowance ? formatUnits(allowance, 6) : '0'} USDC
          </span>
        </p>
        {allowance && allowance > 0n ? (
          <p className="text-green-400 text-sm mt-1">✓ DividendPool is approved</p>
        ) : (
          <p className="text-yellow-400 text-sm mt-1">⚠ Please approve DividendPool first</p>
        )}
      </div>

      {/* Step 0: Approve */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Step 0: Approve USDC</h4>
          <p className="text-gray-400 text-sm mb-4">
            Allow the DividendPool contract to transfer USDC on your behalf
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Amount to Approve (USDC)
          </label>
          <input
            type="number"
            value={approveAmount}
            onChange={(e) => setApproveAmount(e.target.value)}
            placeholder="Enter amount (e.g., 1000)"
            className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-gray-500 text-xs mt-1">
            Approve at least the amount you plan to distribute
          </p>
        </div>

        <button
          onClick={handleApprove}
          disabled={!approveAmount || isApproving}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition"
        >
          {isApproving ? 'Approving...' : '✅ Approve USDC'}
        </button>

        {isApproveSuccess && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3">
            <p className="text-green-400 text-sm">✓ Approval successful!</p>
            <a
              href={`https://sepolia.arbiscan.io/tx/${approveHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-xs hover:underline"
            >
              View on Arbiscan →
            </a>
          </div>
        )}
      </div>

      <div className="border-t border-gray-700"></div>

      {/* Step 1: Run iApp */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Step 1: Calculate Dividends</h4>
          <p className="text-gray-400 text-sm mb-4">
            Run the iApp in TEE to process all protected balances and generate the Merkle tree
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Protected Data Addresses (comma-separated)
          </label>
          <textarea
            value={protectedDataAddresses}
            onChange={(e) => setProtectedDataAddresses(e.target.value)}
            placeholder="0xabc...,0xdef...,0x123..."
            rows={3}
            className="w-full bg-gray-700 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-gray-500 text-xs mt-1">
            Enter the Protected Data addresses from users who protected their balances (Tab 1)
          </p>
        </div>

        <button
          onClick={handleRunIApp}
          disabled={!isReady || !!iappStatus || !protectedDataAddresses}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition"
        >
          {iappStatus ? iappStatus : '⚙️ Run iApp Calculation'}
        </button>

        {iappStatus && (
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
            <p className="text-blue-400 font-medium">⏳ {iappStatus}</p>
          </div>
        )}

        {merkleRoot && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400 font-medium mb-2">✓ Merkle Root Set</p>
            <p className="text-gray-300 text-sm font-mono break-all">
              {merkleRoot}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-700"></div>

      {/* Step 2: Start Distribution */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Step 2: Start Distribution Round</h4>
          <p className="text-gray-400 text-sm mb-4">
            Publish the Merkle root and total pool amount to the blockchain
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
            placeholder="Enter amount (e.g., 1)"
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
            placeholder="Run iApp calculation or paste manually"
            className="w-full bg-gray-700 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-500 text-xs mt-1">
            Will be set automatically after iApp execution, or paste manually
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleStartDistribution}
          disabled={!totalPool || !merkleRoot || isDistributing || (allowance !== undefined && allowance === 0n)}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition"
        >
          {isDistributing ? 'Confirming Transaction...' : '📤 Start Distribution Round'}
        </button>

        {isDistributionSuccess && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400 font-medium">✓ Distribution Started!</p>
            <p className="text-gray-400 text-sm mt-1">
              Token holders can now claim their dividends in Tab 3.
            </p>
            <a
              href={`https://sepolia.arbiscan.io/tx/${distributionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-sm hover:underline mt-2 inline-block"
            >
              View on Arbiscan →
            </a>
          </div>
        )}
      </div>

      {/* Quick Guide */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <h4 className="font-medium mb-2">📋 Quick Guide</h4>
        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
          <li>Approve USDC for the amount you want to distribute</li>
          <li>Enter Protected Data addresses (from users who protected balances in Tab 1)</li>
          <li>Enter total pool amount in Step 2</li>
          <li>Run iApp calculation in Step 1 to get Merkle root</li>
          <li>Start distribution round in Step 2</li>
          <li>Users can claim in Tab 3</li>
        </ol>
      </div>
    </div>
  );
}
