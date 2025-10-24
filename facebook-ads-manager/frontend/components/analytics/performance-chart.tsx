'use client';

import React from 'react';
import { TimeSeriesChart } from './time-series-chart';
import type { TimeSeriesDataPoint } from '@/types/analytics';

interface PerformanceChartProps {
  data: TimeSeriesDataPoint[];
  comparisonData?: TimeSeriesDataPoint[];
  metrics: Array<keyof Omit<TimeSeriesDataPoint, 'date'>>;
  height?: number;
}

export function PerformanceChart({
  data,
  comparisonData,
  metrics,
  height = 400,
}: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No data available for the selected period</p>
          <p className="mt-1 text-xs">Try adjusting your date range</p>
        </div>
      </div>
    );
  }

  return (
    <TimeSeriesChart
      data={data}
      comparisonData={comparisonData}
      metrics={metrics}
      height={height}
    />
  );
}
