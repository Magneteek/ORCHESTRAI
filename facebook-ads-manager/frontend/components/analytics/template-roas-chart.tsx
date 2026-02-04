'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';

interface TemplateData {
  id: string;
  name: string;
  avgRoas: number | null;
}

interface TemplateRoasChartProps {
  templates: TemplateData[];
  limit?: number;
}

export function TemplateRoasChart({ templates, limit = 10 }: TemplateRoasChartProps) {
  const chartData = React.useMemo(() => {
    return templates
      .filter((t) => t.avgRoas !== null)
      .sort((a, b) => (b.avgRoas || 0) - (a.avgRoas || 0))
      .slice(0, limit)
      .map((t) => ({
        name: t.name.length > 25 ? `${t.name.substring(0, 25)}...` : t.name,
        roas: t.avgRoas,
      }))
      .reverse(); // Reverse for horizontal chart
  }, [templates, limit]);

  const getBarColor = (roas: number) => {
    if (roas >= 3) return '#22c55e'; // green-500
    if (roas >= 1) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-medium">{data.payload.name}</p>
          <p className="mt-1 text-sm">
            <span className="text-muted-foreground">ROAS:</span>{' '}
            <span className="font-semibold">{data.value.toFixed(2)}x</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Top Templates by ROAS</h3>
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-sm text-muted-foreground">No ROAS data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Top Templates by ROAS</h3>
          <p className="text-sm text-muted-foreground">
            Top {Math.min(limit, templates.length)} performing templates
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-500"></div>
            <span>ROAS ≥ 3.0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-yellow-500"></div>
            <span>ROAS 1.0-3.0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500"></div>
            <span>ROAS &lt; 1.0</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={(value) => `${value.toFixed(1)}x`}
            className="text-xs"
          />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            className="text-xs"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
          <Bar dataKey="roas" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.roas ?? 0)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
