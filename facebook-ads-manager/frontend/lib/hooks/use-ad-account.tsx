'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/helpers/api-client';

const STORAGE_KEY = 'selectedAdAccountId';

interface AdAccount {
  id: string;
  accountId: string;
  name: string;
  currency: string;
  timezone: string;
  accountStatus: string;
  facebookBusinessAccount?: {
    name: string;
    businessId: string;
  };
}

interface AdAccountContextValue {
  accounts: AdAccount[];
  selectedAccountId: string | null;
  selectedAccount: AdAccount | null;
  setSelectedAccountId: (id: string | null) => void;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const AdAccountContext = createContext<AdAccountContextValue | null>(null);

export function AdAccountProvider({ children }: { children: ReactNode }) {
  const [selectedAccountId, setSelectedAccountIdState] = useState<string | null>(null);

  // Load persisted selection on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSelectedAccountIdState(stored);
    }
  }, []);

  const { data: accounts = [], isLoading, error, refetch } = useQuery<AdAccount[]>({
    queryKey: ['ad-accounts'],
    queryFn: () => apiClient.get<AdAccount[]>('/api/ad-accounts'),
    staleTime: 60 * 1000, // 1 minute
  });

  // Auto-select first account if none selected or selection is invalid
  useEffect(() => {
    if (accounts.length === 0) return;

    const currentValid = accounts.some((a) => a.id === selectedAccountId);
    if (!selectedAccountId || !currentValid) {
      const firstId = accounts[0].id;
      setSelectedAccountIdState(firstId);
      localStorage.setItem(STORAGE_KEY, firstId);
    }
  }, [accounts, selectedAccountId]);

  const setSelectedAccountId = useCallback(
    (id: string | null) => {
      setSelectedAccountIdState(id);
      if (id) {
        localStorage.setItem(STORAGE_KEY, id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    []
  );

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) ?? null;

  return (
    <AdAccountContext.Provider
      value={{
        accounts,
        selectedAccountId,
        selectedAccount,
        setSelectedAccountId,
        isLoading,
        error: error as Error | null,
        refetch,
      }}
    >
      {children}
    </AdAccountContext.Provider>
  );
}

export function useAdAccount() {
  const context = useContext(AdAccountContext);
  if (!context) {
    throw new Error('useAdAccount must be used within an AdAccountProvider');
  }
  return context;
}
