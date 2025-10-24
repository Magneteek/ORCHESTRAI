'use client';

import React from 'react';
import { DateRangePicker } from './date-range-picker';
import type { DateRange } from '@/types/analytics';

interface ComparisonModeProps {
  dateRange: DateRange;
  onChange: (dateRange: DateRange) => void;
}

export function ComparisonMode({ dateRange, onChange }: ComparisonModeProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        Compare to period:
      </label>
      <DateRangePicker dateRange={dateRange} onChange={onChange} />
    </div>
  );
}
