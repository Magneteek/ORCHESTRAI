'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/ui/card';

interface TemplateData {
  id: string;
  name: string;
  totalSpend: number;
}

interface SpendDistributionChartProps {
  templates: TemplateData[];
  topN?: number;
}

const COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#6b7280', // gray-500 (for "Others")
];

export function SpendDistributionChart({ templates, topN = 5 }: SpendDistributionChartProps) {
  const chartData = React.useMemo(() => {
    const sortedTemplates = [...templates]
      .sort((a, b) => b.totalSpend - a.totalSpend);

    const topTemplates = sortedTemplates.slice(0, topN);
    const otherTemplates = sortedTemplates.slice(topN);

    const data = topTemplates.map((t) => ({
      name: t.name.length > 30 ? `${t.name.substring(0, 30)}...` : t.name,
      value: t.totalSpend,
    }));

    if (otherTemplates.length > 0) {
      const othersTotal = otherTemplates.reduce((sum, t) => sum + t.totalSpend, 0);
      data.push({
        name: `Others (${otherTemplates.length})`,
        value: othersTotal,
      });
    }

    return data;
  }, [templates, topN]);

  const totalSpend = React.useMemo(() => {
    return templates.reduce((sum, t) => sum + t.totalSpend, 0);
  }, [templates]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = (data.value / totalSpend) * 100;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="mt-1 text-sm">
            <span className="text-muted-foreground">Spend:</span>{' '}
            <span className="font-semibold">{formatCurrency(data.value)}</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Share:</span>{' '}
            <span className="font-semibold">{percentage.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Hide labels for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (templates.length === 0 || totalSpend === 0) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Spend Distribution</h3>
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-sm text-muted-foreground">No spend data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Spend Distribution</h3>
        <p className="text-sm text-muted-foreground">
          Total spend across top templates
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={130}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => {
              const percentage = ((entry.payload.value / totalSpend) * 100).toFixed(1);
              return `${value} (${percentage}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 rounded-lg bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Spend</span>
          <span className="text-lg font-bold">{formatCurrency(totalSpend)}</span>
        </div>
      </div>
    </Card>
  );
}
