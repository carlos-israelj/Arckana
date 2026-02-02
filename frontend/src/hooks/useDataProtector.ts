import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

// Dynamic import type for DataProtector
type IExecDataProtector = any;
type IExecDataProtectorCore = any;

/**
 * Custom hook for iExec DataProtector integration
 * Provides easy access to DataProtector functionality
 */
export function useDataProtector() {
  const { isConnected, connector } = useAccount();
  const [dataProtector, setDataProtector] = useState<IExecDataProtector | null>(null);
  const [dataProtectorCore, setDataProtectorCore] = useState<IExecDataProtectorCore | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeDataProtector = async () => {
      // Only run in browser
      if (typeof window === 'undefined') return;

      if (!isConnected || !connector) {
        setDataProtector(null);
        setDataProtectorCore(null);
        return;
      }

      setIsInitializing(true);
      setError(null);

      try {
        // Dynamic import - webpack will handle this correctly
        const dataProtectorModule = await import('@iexec/dataprotector');
        const { IExecDataProtector } = dataProtectorModule;

        const provider = await connector.getProvider() as import('ethers').Eip1193Provider;

        const dp = new IExecDataProtector(provider, {
          allowExperimentalNetworks: true, // Required for Arbitrum Sepolia
        });

        setDataProtector(dp);
        setDataProtectorCore(dp.core);
      } catch (err) {
        console.error('Failed to initialize DataProtector:', err);
        setError(err as Error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDataProtector();
  }, [isConnected, connector]);

  return {
    dataProtector,
    dataProtectorCore,
    isInitializing,
    error,
    isReady: !isInitializing && !!dataProtectorCore,
  };
}

/**
 * Hook for protecting data with status updates
 */
export function useProtectData() {
  const { dataProtectorCore } = useDataProtector();
  const [isProtecting, setIsProtecting] = useState(false);
  const [status, setStatus] = useState<{ title: string; isDone: boolean } | null>(null);

  const protectData = async (data: {
    data: Record<string, any>;
    name: string;
  }) => {
    if (!dataProtectorCore) {
      throw new Error('DataProtector not initialized');
    }

    setIsProtecting(true);
    setStatus(null);

    try {
      const result = await dataProtectorCore.protectData({
        data: data.data,
        name: data.name,
        onStatusUpdate: ({ title, isDone }: { title: string; isDone: boolean }) => {
          setStatus({ title, isDone });
          console.log(`Protect Data Status: ${title}, Done: ${isDone}`);
        },
      });

      return result;
    } finally {
      setIsProtecting(false);
      setStatus(null);
    }
  };

  return {
    protectData,
    isProtecting,
    status,
  };
}

/**
 * Hook for granting access to protected data
 */
export function useGrantAccess() {
  const { dataProtectorCore } = useDataProtector();
  const [isGranting, setIsGranting] = useState(false);
  const [status, setStatus] = useState<{ title: string; isDone: boolean } | null>(null);

  const grantAccess = async (params: {
    protectedData: string;
    authorizedApp: string;
    authorizedUser?: string;
    pricePerAccess?: number;
    numberOfAccess?: number;
  }) => {
    if (!dataProtectorCore) {
      throw new Error('DataProtector not initialized');
    }

    setIsGranting(true);
    setStatus(null);

    try {
      const result = await dataProtectorCore.grantAccess({
        protectedData: params.protectedData,
        authorizedApp: params.authorizedApp,
        authorizedUser: params.authorizedUser || '0x0000000000000000000000000000000000000000',
        pricePerAccess: params.pricePerAccess || 0,
        numberOfAccess: params.numberOfAccess || 1,
        onStatusUpdate: ({ title, isDone }: { title: string; isDone: boolean }) => {
          setStatus({ title, isDone });
          console.log(`Grant Access Status: ${title}, Done: ${isDone}`);
        },
      });

      return result;
    } finally {
      setIsGranting(false);
      setStatus(null);
    }
  };

  return {
    grantAccess,
    isGranting,
    status,
  };
}
