'use client';

import { useState } from 'react';
import { Facebook, ExternalLink, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdAccount } from '@/lib/hooks/use-ad-account';
import { apiClient } from '@/lib/helpers/api-client';

export default function SettingsPage() {
  const { accounts, isLoading, refetch } = useAdAccount();
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  async function handleConnectFacebook() {
    setConnecting(true);
    setConnectError(null);

    try {
      const data = await apiClient.get<{ authUrl: string }>('/api/facebook/connect');
      window.location.href = data.authUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start Facebook connection';
      setConnectError(message);
      setConnecting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account connections and preferences
        </p>
      </div>

      {/* Facebook Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5" />
            Facebook Connection
          </CardTitle>
          <CardDescription>
            Connect your Facebook Business account to manage ad campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connect Button — permission enforced server-side via requirePermission('canConnectFacebook') */}
          <div>
            <Button
              onClick={handleConnectFacebook}
              disabled={connecting}
              className="gap-2"
            >
              {connecting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Facebook className="h-4 w-4" />
              )}
              {connecting ? 'Connecting...' : 'Connect Facebook Account'}
              <ExternalLink className="h-3 w-3" />
            </Button>
            {connectError && (
              <p className="mt-2 text-sm text-destructive">{connectError}</p>
            )}
          </div>

          {/* Connected Accounts */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">
              Connected Ad Accounts
              {!isLoading && ` (${accounts.length})`}
            </h3>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg border bg-muted" />
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <Facebook className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No accounts connected</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Connect your Facebook Business account to get started
                </p>
              </div>
            ) : (
              accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{account.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {account.accountId} &middot; {account.currency} &middot; {account.timezone}
                    </p>
                  </div>
                  <Badge
                    variant={account.accountStatus === 'ACTIVE' ? 'active' : 'secondary'}
                    className="gap-1"
                  >
                    {account.accountStatus === 'ACTIVE' ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {account.accountStatus}
                  </Badge>
                </div>
              ))
            )}
          </div>

          {accounts.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-3 w-3" />
              Refresh Accounts
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
