'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';
import type { TimeSeriesDataPoint } from '@/types/analytics';

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  comparisonData?: TimeSeriesDataPoint[];
  metrics: Array<keyof Omit<TimeSeriesDataPoint, 'date'>>;
  height?: number;
  className?: string;
}

interface TooltipData {
  date: string;
  items: Array<{
    label: string;
    value: string;
    color: string;
  }>;
}

const COLORS = {
  impressions: '#3b82f6',
  clicks: '#8b5cf6',
  spend: '#ec4899',
  conversions: '#10b981',
  ctr: '#f59e0b',
  roas: '#06b6d4',
};

const METRIC_LABELS = {
  impressions: 'Impressions',
  clicks: 'Clicks',
  spend: 'Spend',
  conversions: 'Conversions',
  ctr: 'CTR',
  roas: 'ROAS',
};

export function TimeSeriesChart({
  data,
  comparisonData,
  metrics,
  height = 400,
  className,
}: TimeSeriesChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 120, bottom: 40, left: 60 };
    const width = svgRef.current.clientWidth;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates
    const parseDate = d3.timeParse('%Y-%m-%d');
    const parsedData = data.map(d => ({
      ...d,
      parsedDate: parseDate(d.date) || new Date(),
    }));

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(parsedData, d => d.parsedDate) as [Date, Date])
      .range([0, innerWidth]);

    // Create separate y-scales for each metric
    const yScales: Record<string, d3.ScaleLinear<number, number>> = {};
    metrics.forEach(metric => {
      const values = parsedData.map(d => d[metric] as number);
      yScales[metric] = d3
        .scaleLinear()
        .domain([0, d3.max(values) || 0])
        .range([innerHeight, 0])
        .nice();
    });

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(yScales[metrics[0]])
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      );

    // Add X axis
    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(6)
          .tickFormat(d3.timeFormat('%b %d') as any)
      );

    xAxis
      .selectAll('text')
      .attr('class', 'text-xs')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.7);

    xAxis
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('opacity', 0.1);

    xAxis
      .select('.domain')
      .attr('stroke', 'currentColor')
      .attr('opacity', 0.1);

    // Add Y axis for primary metric
    const yAxis = g
      .append('g')
      .call(
        d3
          .axisLeft(yScales[metrics[0]])
          .ticks(5)
          .tickFormat(d => d3.format('.2s')(d as number))
      );

    yAxis
      .selectAll('text')
      .attr('class', 'text-xs')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.7);

    yAxis
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('opacity', 0.1);

    yAxis
      .select('.domain')
      .attr('stroke', 'currentColor')
      .attr('opacity', 0.1);

    // Add lines for each metric
    metrics.forEach((metric, index) => {
      const line = d3
        .line<typeof parsedData[0]>()
        .x(d => xScale(d.parsedDate))
        .y(d => yScales[metric](d[metric] as number))
        .curve(d3.curveMonotoneX);

      // Add area
      const area = d3
        .area<typeof parsedData[0]>()
        .x(d => xScale(d.parsedDate))
        .y0(innerHeight)
        .y1(d => yScales[metric](d[metric] as number))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(parsedData)
        .attr('fill', COLORS[metric as keyof typeof COLORS])
        .attr('fill-opacity', 0.1)
        .attr('d', area);

      g.append('path')
        .datum(parsedData)
        .attr('fill', 'none')
        .attr('stroke', COLORS[metric as keyof typeof COLORS])
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add dots
      g.selectAll(`.dot-${metric}`)
        .data(parsedData)
        .enter()
        .append('circle')
        .attr('class', `dot-${metric}`)
        .attr('cx', d => xScale(d.parsedDate))
        .attr('cy', d => yScales[metric](d[metric] as number))
        .attr('r', 3)
        .attr('fill', COLORS[metric as keyof typeof COLORS])
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', function (event, d) {
          d3.select(this).attr('r', 5);

          const items = metrics.map(m => ({
            label: METRIC_LABELS[m as keyof typeof METRIC_LABELS],
            value: formatValue(d[m] as number, m),
            color: COLORS[m as keyof typeof COLORS],
          }));

          setTooltipData({
            date: d3.timeFormat('%B %d, %Y')(d.parsedDate),
            items,
          });

          const [x, y] = d3.pointer(event, svgRef.current);
          setTooltipPosition({ x: x + margin.left, y: y + margin.top });
        })
        .on('mouseleave', function () {
          d3.select(this).attr('r', 3);
          setTooltipData(null);
        });
    });

    // Add legend
    const legend = g
      .append('g')
      .attr('transform', `translate(${innerWidth + 20}, 0)`);

    metrics.forEach((metric, index) => {
      const legendItem = legend
        .append('g')
        .attr('transform', `translate(0, ${index * 25})`);

      legendItem
        .append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', COLORS[metric as keyof typeof COLORS])
        .attr('rx', 2);

      legendItem
        .append('text')
        .attr('x', 18)
        .attr('y', 9)
        .attr('class', 'text-xs')
        .attr('fill', 'currentColor')
        .text(METRIC_LABELS[metric as keyof typeof METRIC_LABELS]);
    });

    // Add comparison data if provided
    if (comparisonData && comparisonData.length > 0) {
      const parsedComparisonData = comparisonData.map(d => ({
        ...d,
        parsedDate: parseDate(d.date) || new Date(),
      }));

      metrics.forEach(metric => {
        const line = d3
          .line<typeof parsedComparisonData[0]>()
          .x(d => xScale(d.parsedDate))
          .y(d => yScales[metric](d[metric] as number))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(parsedComparisonData)
          .attr('fill', 'none')
          .attr('stroke', COLORS[metric as keyof typeof COLORS])
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .attr('opacity', 0.5)
          .attr('d', line);
      });
    }
  }, [data, comparisonData, metrics, height]);

  const formatValue = (value: number, metric: string): string => {
    if (metric === 'spend') {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (metric === 'ctr') {
      return `${(value * 100).toFixed(2)}%`;
    } else if (metric === 'roas') {
      return `${value.toFixed(2)}x`;
    } else {
      return value.toLocaleString();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        className="overflow-visible"
        role="img"
        aria-label="Time series chart showing campaign performance metrics"
      />

      {tooltipData && (
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute z-50 rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%) translateY(-8px)',
          }}
        >
          <div className="text-xs font-semibold mb-2">{tooltipData.date}</div>
          <div className="space-y-1">
            {tooltipData.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.label}:</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
