import type { NextRequest } from 'next/server';

/**
 * Guard for scheduled routes under /api/cron/*.
 *
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET` on every invocation.
 * These routes mutate data and hold no user session, so they must never be
 * publicly callable.
 *
 * Fails CLOSED: if CRON_SECRET is unset the route is denied rather than left
 * open. An unset secret in production would otherwise mean an unauthenticated
 * endpoint that can trigger full Facebook syncs and data deletion.
 */
export type CronAuthResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export function checkCronAuth(request: NextRequest): CronAuthResult {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return {
      ok: false,
      status: 503,
      message: 'CRON_SECRET is not configured; refusing to run an unauthenticated cron job',
    };
  }

  const header = request.headers.get('authorization');
  if (header !== `Bearer ${secret}`) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  return { ok: true };
}
