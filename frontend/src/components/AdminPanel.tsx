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

      let taskId: string | undefined;

      // Execute the iApp with protected data
      try {
        const result = await dataProtectorCore.processProtectedData({
          protectedData: addressList[0], // Process first one or array
          app: IAPP_ADDRESS,
          args: totalPoolBaseUnits, // Pass total pool amount in base units
          workerpool: '0xB967057a21dc6A66A29721d96b8Aa7454B7c383F', // Arbitrum Sepolia prod workerpool
          workerpoolMaxPrice: 200000000, // 0.2 nRLC - max price willing to pay for workerpool
          appMaxPrice: 200000000, // 0.2 nRLC - max price willing to pay for app
          onStatusUpdate: ({ title, isDone }: { title: string; isDone: boolean }) => {
            setIappStatus(title);
            console.log(`iApp Status: ${title}, Done: ${isDone}`);

            // Try to capture taskId from REQUEST_TO_PROCESS_PROTECTED_DATA status
            if (title === 'REQUEST_TO_PROCESS_PROTECTED_DATA' && isDone) {
              console.log('Task should be created now, attempting to capture taskId...');
            }
          },
        });

        console.log('iApp execution result:', result);
        taskId = (result as any).taskId;
        console.log('Task ID:', taskId);

      } catch (execError: any) {
        // Task might have been created but monitoring failed
        console.error('Error during execution:', execError);
        console.error('Error stack:', execError.stack);
        console.error('Full error object:', JSON.stringify(execError, null, 2));

        // Try to extract taskId from multiple possible locations in the error
        if (execError.result?.taskId) {
          taskId = execError.result.taskId;
        } else if (execError.taskId) {
          taskId = execError.taskId;
        } else if (execError.context?.taskId) {
          taskId = execError.context.taskId;
        } else if (execError.originalError?.taskId) {
          taskId = execError.originalError.taskId;
        }

        // Check if this is an RPC monitoring error (task likely created successfully)
        const isRpcError =
          execError.message?.toLowerCase().includes('json-rpc') ||
          execError.message?.toLowerCase().includes('missing revert data') ||
          execError.message?.toLowerCase().includes('wait for task') ||
          execError.message?.toLowerCase().includes('internal json-rpc') ||
          execError.cause?.message?.toLowerCase().includes('json-rpc') ||
          execError.cause?.message?.toLowerCase().includes('missing revert data');

        if (taskId) {
          console.log('Task ID extracted from error:', taskId);
          alert(
            '✅ iApp Task Created Successfully!\n\n' +
            `Task ID: ${taskId}\n\n` +
            `🔗 Check task status:\nhttps://explorer.iex.ec/arbitrum-sepolia-testnet/task/${taskId}\n\n` +
            '⏳ The task is running in the TEE.\n' +
            'Due to RPC monitoring issues, please:\n\n' +
            '1. Click the link above to open the Explorer\n' +
            '2. Wait 2-3 minutes for task completion\n' +
            '3. Once COMPLETED, click "Show results" in Explorer\n' +
            '4. Copy the merkle_root value\n' +
            '5. Paste it in Step 2 below\n\n' +
            '💡 Tip: Refresh the Explorer page to see status updates'
          );
          setIappStatus('');
          return;
        }

        // If we couldn't extract taskId but this looks like an RPC error
        if (isRpcError) {
          console.log('RPC error detected but no taskId found');
          alert(
            '⚠️ Task Likely Created, But Cannot Monitor\n\n' +
            'The task was likely created successfully, but we cannot track it due to RPC issues.\n\n' +
            `🔗 Check your recent tasks:\nhttps://explorer.iex.ec/arbitrum-sepolia-testnet/account/${address}\n\n` +
            '📋 Next steps:\n' +
            '1. Open the link above\n' +
            '2. Find the most recent task (created just now)\n' +
            '3. Wait 2-3 minutes for it to complete\n' +
            '4. Get the merkle_root from task results\n' +
            '5. Paste it in Step 2 below'
          );
          setIappStatus('');
          return;
        }

        throw execError; // Re-throw if this doesn't look like an RPC error
      }

      setIappStatus('Fetching task result...');
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
            '⏳ iApp Execution Started!\n\n' +
            `Task ID: ${taskId}\n\n` +
            `🔗 Explorer:\nhttps://explorer.iex.ec/arbitrum-sepolia-testnet/task/${taskId}\n\n` +
            '📋 Next steps:\n' +
            '1. Wait 2-3 minutes for task completion\n' +
            '2. Check task results on iExec Explorer\n' +
            '3. Copy the merkle_root when ready\n' +
            '4. Paste it in Step 2 below'
          );
        }
      } catch (fetchError) {
        console.log('Could not fetch result yet:', fetchError);
        alert(
          '⏳ iApp Task Running in TEE\n\n' +
          `Task ID: ${taskId}\n\n` +
          `🔗 Explorer:\nhttps://explorer.iex.ec/arbitrum-sepolia-testnet/task/${taskId}\n\n` +
          '📋 Next steps:\n' +
          '1. Wait 2-3 minutes for completion\n' +
          '2. Check the Explorer link above\n' +
          '3. Once COMPLETED, get the merkle_root\n' +
          '4. Paste it manually in Step 2 below'
        );
      }

      setIappStatus('');

    } catch (error: any) {
      console.error('Error running iApp:', error);

      // Check if this is a monitoring/RPC error but task might have been created
      const isRpcError =
        error.message?.toLowerCase().includes('json-rpc') ||
        error.message?.toLowerCase().includes('missing revert data') ||
        error.message?.toLowerCase().includes('wait for task') ||
        error.message?.toLowerCase().includes('internal json-rpc');

      if (isRpcError) {
        alert(
          '⚠️ Task Likely Created, But Cannot Monitor\n\n' +
          'Your iApp task was likely created successfully, but we cannot monitor it due to RPC issues.\n\n' +
          `🔗 Check your recent tasks:\nhttps://explorer.iex.ec/arbitrum-sepolia-testnet/account/${address}\n\n` +
          '📋 Next steps:\n' +
          '1. Open the link above\n' +
          '2. Find the most recent task (created just now)\n' +
          '3. Wait 2-3 minutes for it to complete\n' +
          '4. Once COMPLETED, click "Show results"\n' +
          '5. Copy the merkle_root value\n' +
          '6. Paste it in Step 2 below'
        );
      } else {
        alert(
          `❌ Error Running iApp\n\n` +
          `Error: ${error.message || 'Unknown error'}\n\n` +
          'Check the browser console for more details.'
        );
      }
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

        <div>
          <label className="block text-sm font-medium mb-2">
            Total Pool Amount (USDC)
          </label>
          <input
            type="number"
            value={totalPool}
            onChange={(e) => setTotalPool(e.target.value)}
            placeholder="Enter amount (e.g., 100)"
            className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-gray-500 text-xs mt-1">
            Total USDC to distribute (will be used in iApp calculation)
          </p>
        </div>

        <button
          onClick={handleRunIApp}
          disabled={!isReady || !!iappStatus || !protectedDataAddresses || !totalPool}
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
          <li>In Step 1: Enter Protected Data addresses and Total Pool amount</li>
          <li>Run iApp calculation in Step 1 to get Merkle root</li>
          <li>In Step 2: Verify the same Total Pool amount and Merkle root</li>
          <li>Start distribution round in Step 2</li>
          <li>Users can claim in Tab 3</li>
        </ol>
      </div>
    </div>
  );
}
