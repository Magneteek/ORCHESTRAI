'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, LucideIcon } from 'lucide-react';
import * as d3 from 'd3';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  sparklineData?: number[];
  format?: 'currency' | 'percentage' | 'number';
  isLoading?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = 'vs previous period',
  icon: Icon,
  iconColor = 'text-blue-600',
  sparklineData = [],
  format = 'number',
  isLoading = false,
}: MetricCardProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (!svgRef.current || sparklineData.length === 0 || isLoading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 120;
    const height = 30;
    const margin = { top: 2, right: 2, bottom: 2, left: 2 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain([0, sparklineData.length - 1])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([d3.min(sparklineData) || 0, d3.max(sparklineData) || 0])
      .range([innerHeight, 0]);

    const line = d3.line<number>()
      .x((_, i) => x(i))
      .y((d) => y(d))
      .curve(d3.curveMonotoneX);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Area gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', `gradient-${title}`)
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'currentColor')
      .attr('stop-opacity', 0.3);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'currentColor')
      .attr('stop-opacity', 0);

    // Area
    const area = d3.area<number>()
      .x((_, i) => x(i))
      .y0(innerHeight)
      .y1((d) => y(d))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(sparklineData)
      .attr('fill', `url(#gradient-${title})`)
      .attr('d', area);

    // Line
    g.append('path')
      .datum(sparklineData)
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 1.5)
      .attr('d', line);
  }, [sparklineData, title, isLoading]);

  const formattedValue = React.useMemo(() => {
    if (isLoading) return '...';
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  }, [value, format, isLoading]);

  const changeColor = React.useMemo(() => {
    if (!change) return 'text-muted-foreground';
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  }, [change]);

  const ChangeIcon = React.useMemo(() => {
    if (!change) return Minus;
    if (change > 0) return ArrowUp;
    return ArrowDown;
  }, [change]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            ) : (
              formattedValue
            )}
          </div>

          {change !== undefined && (
            <div className="flex items-center space-x-1">
              <ChangeIcon className={cn('h-3 w-3', changeColor)} />
              <span className={cn('text-xs font-medium', changeColor)}>
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {changeLabel}
              </span>
            </div>
          )}

          {sparklineData.length > 0 && (
            <svg
              ref={svgRef}
              width={120}
              height={30}
              className={cn('text-primary', isLoading && 'opacity-50')}
              aria-label={`Sparkline chart for ${title}`}
              role="img"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
