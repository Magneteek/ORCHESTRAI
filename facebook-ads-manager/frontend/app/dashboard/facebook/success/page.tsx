'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FacebookSuccessPage() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get('accountId');

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Facebook Connected!</CardTitle>
          <CardDescription>
            Your Facebook Business account has been successfully connected.
            Your ad accounts have been imported and are ready to use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {accountId && (
            <p className="text-xs text-muted-foreground">
              Account ID: {accountId}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full">
                View Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
