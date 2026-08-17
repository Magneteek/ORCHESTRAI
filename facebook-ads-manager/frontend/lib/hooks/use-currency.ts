'use client';

import { useMemo } from 'react';
import { useAdAccount } from './use-ad-account';

/**
 * Currency formatter bound to the selected ad account.
 *
 * Every money figure in the app was formatted as USD regardless of the account
 * it came from, so EUR-reporting accounts — which is most of them here — had
 * their spend printed with a dollar sign. The numbers were right and the symbol
 * was wrong, which is the worst combination: nothing looks broken.
 *
 * Facebook reports each account's amounts in that account's own currency, so
 * the account's `currency` field is the correct unit for anything derived from
 * performance_metrics.
 */
export function useCurrency() {
  const { selectedAccount } = useAdAccount();
  const currency = selectedAccount?.currency || 'USD';

  return useMemo(() => {
    const format = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format;

    return {
      currency,
      /** Full precision, e.g. €1,462.52 */
      format,
      /** No decimals, for axis ticks and tight tiles, e.g. €1,463 */
      formatCompact: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format,
    };
  }, [currency]);
}
