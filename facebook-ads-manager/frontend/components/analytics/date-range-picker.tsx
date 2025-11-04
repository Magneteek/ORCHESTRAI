'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DateRange } from '@/types/analytics';

interface DateRangePickerProps {
  dateRange: DateRange;
  onChange: (dateRange: DateRange) => void;
}

const PRESET_RANGES = {
  '7d': { label: 'Last 7 days', days: 7 },
  '14d': { label: 'Last 14 days', days: 14 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 },
  'mtd': { label: 'Month to date', days: 'mtd' as const },
  'qtd': { label: 'Quarter to date', days: 'qtd' as const },
  'ytd': { label: 'Year to date', days: 'ytd' as const },
};

export function DateRangePicker({ dateRange, onChange }: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('30d');
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const config = PRESET_RANGES[preset as keyof typeof PRESET_RANGES];

    if (!config) return;

    const to = new Date();
    let from: Date;

    if (typeof config.days === 'number') {
      from = new Date(Date.now() - config.days * 24 * 60 * 60 * 1000);
    } else if (config.days === 'mtd') {
      from = new Date(to.getFullYear(), to.getMonth(), 1);
    } else if (config.days === 'qtd') {
      const quarter = Math.floor(to.getMonth() / 3);
      from = new Date(to.getFullYear(), quarter * 3, 1);
    } else if (config.days === 'ytd') {
      from = new Date(to.getFullYear(), 0, 1);
    } else {
      from = to;
    }

    onChange({ from, to });
    setShowCustom(false);
  };

  const formatDateRange = (range: DateRange): string => {
    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    const fromStr = range.from.toLocaleDateString('en-US', formatOptions);
    const toStr = range.to.toLocaleDateString('en-US', formatOptions);

    return `${fromStr} - ${toStr}`;
  };

  const handleCustomDateChange = (type: 'from' | 'to', value: string) => {
    const newDate = new Date(value);
    if (isNaN(newDate.getTime())) return;

    onChange({
      ...dateRange,
      [type]: newDate,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />

      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(PRESET_RANGES).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              {config.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>

      {selectedPreset !== 'custom' && (
        <div className="text-sm text-muted-foreground">
          {formatDateRange(dateRange)}
        </div>
      )}

      {(showCustom || selectedPreset === 'custom') && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.from.toISOString().split('T')[0]}
            onChange={(e) => handleCustomDateChange('from', e.target.value)}
            max={dateRange.to.toISOString().split('T')[0]}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <input
            type="date"
            value={dateRange.to.toISOString().split('T')[0]}
            onChange={(e) => handleCustomDateChange('to', e.target.value)}
            min={dateRange.from.toISOString().split('T')[0]}
            max={new Date().toISOString().split('T')[0]}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}

      {!showCustom && selectedPreset !== 'custom' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedPreset('custom');
            setShowCustom(true);
          }}
        >
          Custom
        </Button>
      )}
    </div>
  );
}
