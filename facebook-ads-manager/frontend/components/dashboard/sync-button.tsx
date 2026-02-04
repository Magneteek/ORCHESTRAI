'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/helpers/api-client';
import { useToast } from '@/components/ui/use-toast';

interface SyncButtonProps {
  adAccountId: string;
  onSuccess?: () => void;
}

export function SyncButton({ adAccountId, onSuccess }: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await apiClient.post('/api/sync/campaigns', {
        adAccountId,
      });

      toast({
        title: 'Sync Complete',
        description: `Successfully synced ${result.data?.synced || 0} campaigns`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Sync Failed',
        description: error?.message || 'Failed to sync campaigns',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync from Facebook'}
    </Button>
  );
}
