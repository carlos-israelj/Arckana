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

        const baseProvider = await connector.getProvider() as import('ethers').Eip1193Provider;

        // Create a wrapper provider that adds higher gas prices for Arbitrum Sepolia
        const wrappedProvider = new Proxy(baseProvider, {
          get(target, prop) {
            if (prop === 'request') {
              return async (args: { method: string; params?: any[] }) => {
                // Intercept eth_sendTransaction to add gas configuration
                if (args.method === 'eth_sendTransaction' && args.params?.[0]) {
                  const tx = args.params[0];

                  // Add gas configuration for Arbitrum Sepolia
                  // Use higher values to ensure transactions go through
                  const enhancedTx = {
                    ...tx,
                    maxFeePerGas: '0x5F5E100', // 100000000 wei = 0.1 gwei
                    maxPriorityFeePerGas: '0xF4240', // 1000000 wei = 0.001 gwei
                  };

                  return target.request({
                    method: args.method,
                    params: [enhancedTx, ...(args.params.slice(1) || [])],
                  });
                }

                return target.request(args);
              };
            }

            return (target as any)[prop];
          },
        }) as import('ethers').Eip1193Provider;

        const dp = new IExecDataProtector(wrappedProvider, {
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

/**
 * Hook for processing protected data with iApp
 */
export function useProcessProtectedData() {
  const { dataProtectorCore } = useDataProtector();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ title: string; isDone: boolean } | null>(null);

  const processProtectedData = async (params: {
    app: string;
    protectedData: string[];
    totalPoolAmount: string;
  }) => {
    if (!dataProtectorCore) {
      throw new Error('DataProtector not initialized');
    }

    setIsProcessing(true);
    setStatus(null);

    try {
      const result = await dataProtectorCore.processProtectedData({
        protectedData: params.protectedData,
        app: params.app,
        args: params.totalPoolAmount, // Pass total pool amount as args
        workerpool: '0xB967057a21dc6A66A29721d96b8Aa7454B7c383F', // Arbitrum Sepolia prod workerpool
        workerpoolMaxPrice: 200000000, // 0.2 nRLC - max price willing to pay for workerpool
        onStatusUpdate: ({ title, isDone }: { title: string; isDone: boolean }) => {
          setStatus({ title, isDone });
          console.log(`Process Protected Data Status: ${title}, Done: ${isDone}`);
        },
      });

      return result;
    } finally {
      setIsProcessing(false);
      setStatus(null);
    }
  };

  return {
    processProtectedData,
    isProcessing,
    status,
  };
}
