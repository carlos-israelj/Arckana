'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import DistributionStatus from '@/components/DistributionStatus';
import ClaimDividend from '@/components/ClaimDividend';

// Load ProtectBalance only on client side to avoid webpack processing @iexec/dataprotector during SSR
const ProtectBalance = dynamic(() => import('@/components/ProtectBalance'), {
  ssr: false,
  loading: () => <div className="text-center text-gray-400">Loading...</div>
});

const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  ssr: false,
  loading: () => <div className="text-center text-gray-400">Loading...</div>
});

export default function Home() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'protect' | 'status' | 'claim' | 'admin'>('protect');

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔮</span>
            <h1 className="text-xl font-bold">Arckana</h1>
            <span className="text-gray-500 text-sm">Confidential Dividends</span>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Private Yield Distribution
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Receive dividends from tokenized treasury funds without revealing your balance.
          Powered by iExec confidential computing.
        </p>
      </section>

      {/* Main Content */}
      {isConnected ? (
        <section className="container mx-auto px-4 pb-12">
          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {[
              { id: 'protect', label: '1. Protect Balance', icon: '🔐' },
              { id: 'status', label: '2. Distribution', icon: '📊' },
              { id: 'claim', label: '3. Claim', icon: '💰' },
              { id: 'admin', label: '🔧 Admin', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl p-6">
            {activeTab === 'protect' && <ProtectBalance />}
            {activeTab === 'status' && <DistributionStatus />}
            {activeTab === 'claim' && <ClaimDividend />}
            {activeTab === 'admin' && <AdminPanel />}
          </div>
        </section>
      ) : (
        <section className="container mx-auto px-4 py-12 text-center">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md mx-auto">
            <p className="text-gray-400 mb-4">Connect your wallet to get started</p>
            <ConnectButton />
          </div>
        </section>
      )}

      {/* Info Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-lg font-bold mb-2">Protected Balances</h3>
            <p className="text-gray-400 text-sm">
              Your token balance is encrypted and processed inside a TEE.
              No one can see how much you hold.
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-bold mb-2">Bulk Processing</h3>
            <p className="text-gray-400 text-sm">
              All holder dividends calculated in a single confidential execution.
              Efficient and private.
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-3xl mb-4">🆓</div>
            <h3 className="text-lg font-bold mb-2">Gasless Claims</h3>
            <p className="text-gray-400 text-sm">
              Claim your dividends without paying gas fees.
              Account Abstraction handles it for you.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Built for iExec Hack4Privacy 2026</p>
          <p className="mt-2">
            Powered by iExec Confidential Computing • Arbitrum Sepolia
          </p>
        </div>
      </footer>
    </main>
  );
}
