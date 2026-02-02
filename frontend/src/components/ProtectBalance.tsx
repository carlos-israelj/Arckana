'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { IAPP_ADDRESS } from '@/lib/contracts';
import { useProtectData, useGrantAccess } from '@/hooks/useDataProtector';

export default function ProtectBalance() {
  const { address } = useAccount();
  const [balance, setBalance] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [protectedDataAddress, setProtectedDataAddress] = useState('');

  const { protectData, isProtecting, status: protectStatus } = useProtectData();
  const { grantAccess, isGranting, status: grantStatus } = useGrantAccess();

  const handleProtect = async () => {
    if (!balance || !address) return;

    try {
      // Create protected data with status updates
      const protectedData = await protectData({
        data: {
          holder: address,
          balance: parseInt(balance) * 1000000, // Convert to 6 decimals
        },
        name: `Arckana Balance - ${address.slice(0, 8)}`,
      });

      setProtectedDataAddress(protectedData.address);
      setIsProtected(true);

      console.log('Protected data created:', protectedData);
      alert(`Balance protected successfully!\nAddress: ${protectedData.address}`);

    } catch (error) {
      console.error('Error protecting data:', error);
      alert('Error protecting data. Check console for details.');
    }
  };

  const handleGrantAccess = async () => {
    if (!protectedDataAddress) return;

    if (!IAPP_ADDRESS) {
      alert('iApp address not configured. Please set NEXT_PUBLIC_IAPP_ADDRESS.');
      return;
    }

    try {
      // Grant access to iApp with status updates
      // This automatically deploys orders on the network for the iApp
      const grantedAccess = await grantAccess({
        protectedData: protectedDataAddress,
        authorizedApp: IAPP_ADDRESS,
        authorizedUser: '0x0000000000000000000000000000000000000000', // Any user
        numberOfAccess: 1000, // Allow multiple distributions
      });

      console.log('Access granted:', grantedAccess);
      alert('Access granted! Your balance is ready for the next distribution.');

    } catch (error) {
      console.error('Error granting access:', error);
      alert('Error granting access. Check console for details.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Protect Your Balance</h3>
        <p className="text-gray-400 text-sm">
          Encrypt your token balance so it can be processed confidentially.
        </p>
      </div>

      {!isProtected ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Your ARCANA Token Balance
            </label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="Enter balance (e.g., 1000)"
              className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-gray-500 text-xs mt-1">
              This simulates your tokenized fund holdings
            </p>
          </div>

          {protectStatus && (
            <div className="text-sm text-blue-400 mb-2">
              {protectStatus.title}...
            </div>
          )}

          <button
            onClick={handleProtect}
            disabled={!balance || isProtecting}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition"
          >
            {isProtecting ? 'Protecting...' : '🔐 Protect Balance'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400 font-medium">✓ Balance Protected!</p>
            <p className="text-gray-400 text-sm mt-1">
              Protected Data: {protectedDataAddress.slice(0, 10)}...{protectedDataAddress.slice(-8)}
            </p>
          </div>

          {grantStatus && (
            <div className="text-sm text-blue-400 mb-2">
              {grantStatus.title}...
            </div>
          )}

          <button
            onClick={handleGrantAccess}
            disabled={isGranting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition"
          >
            {isGranting ? 'Granting Access...' : '📋 Grant Access for Distribution'}
          </button>

          <p className="text-gray-500 text-xs text-center">
            This allows the Arckana iApp to include your balance in bulk processing
          </p>
        </div>
      )}
    </div>
  );
}
