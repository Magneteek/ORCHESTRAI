'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';
import type { TopCampaign } from '@/types/analytics';

interface ComparisonChartProps {
  data: TopCampaign[];
  metric: keyof Pick<TopCampaign, 'impressions' | 'clicks' | 'spend' | 'conversions' | 'ctr' | 'roas'>;
  height?: number;
  className?: string;
}

const METRIC_LABELS = {
  impressions: 'Impressions',
  clicks: 'Clicks',
  spend: 'Spend',
  conversions: 'Conversions',
  ctr: 'CTR',
  roas: 'ROAS',
};

const METRIC_FORMATS = {
  impressions: (v: number) => v.toLocaleString(),
  clicks: (v: number) => v.toLocaleString(),
  spend: (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  conversions: (v: number) => v.toLocaleString(),
  ctr: (v: number) => `${(v * 100).toFixed(2)}%`,
  roas: (v: number) => `${v.toFixed(2)}x`,
};

export function ComparisonChart({
  data,
  metric,
  height = 400,
  className,
}: ComparisonChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 40, bottom: 40, left: 200 };
    const width = svgRef.current.clientWidth;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Sort data by metric value
    const sortedData = [...data]
      .sort((a, b) => (b[metric] as number) - (a[metric] as number))
      .slice(0, 10); // Top 10 campaigns

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const yScale = d3
      .scaleBand()
      .domain(sortedData.map(d => d.name))
      .range([0, innerHeight])
      .padding(0.2);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, d => d[metric] as number) || 0])
      .range([0, innerWidth])
      .nice();

    // Color scale
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, sortedData.length]);

    // Add gradient for bars
    const defs = svg.append('defs');
    sortedData.forEach((d, i) => {
      const gradient = defs
        .append('linearGradient')
        .attr('id', `gradient-${i}`)
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScale(i))
        .attr('stop-opacity', 0.8);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScale(i))
        .attr('stop-opacity', 1);
    });

    // Add X axis
    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickFormat(d => d3.format('.2s')(d as number))
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

    // Add Y axis
    const yAxis = g.append('g').call(d3.axisLeft(yScale));

    yAxis
      .selectAll('text')
      .attr('class', 'text-sm')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.9)
      .style('font-weight', '500')
      .text(function() {
        const text = d3.select(this).text();
        return text.length > 25 ? text.substring(0, 25) + '...' : text;
      })
      .append('title')
      .text(function() {
        const parent = this.parentNode;
        return parent ? d3.select(parent as Element).text() : '';
      });

    yAxis.select('.domain').remove();
    yAxis.selectAll('line').remove();

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(innerHeight)
          .tickFormat(() => '')
      )
      .call(g => g.select('.domain').remove());

    // Add bars
    const bars = g
      .selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .style('cursor', 'pointer');

    bars
      .append('rect')
      .attr('x', 0)
      .attr('y', d => yScale(d.name) || 0)
      .attr('height', yScale.bandwidth())
      .attr('fill', (d, i) => `url(#gradient-${i})`)
      .attr('rx', 4)
      .attr('width', 0)
      .on('mouseenter', function(event, d) {
        setHoveredBar(d.id);
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8);
      })
      .on('mouseleave', function() {
        setHoveredBar(null);
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);
      })
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr('width', d => xScale(d[metric] as number));

    // Add value labels
    bars
      .append('text')
      .attr('x', d => xScale(d[metric] as number) + 8)
      .attr('y', d => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('class', 'text-xs font-medium')
      .attr('fill', 'currentColor')
      .attr('opacity', 0)
      .text(d => METRIC_FORMATS[metric](d[metric] as number))
      .transition()
      .duration(800)
      .delay((d, i) => i * 50 + 400)
      .attr('opacity', 0.7);

    // Add chart title
    svg
      .append('text')
      .attr('x', margin.left + innerWidth / 2)
      .attr('y', margin.top - 5)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm font-semibold')
      .attr('fill', 'currentColor')
      .text(`Top Campaigns by ${METRIC_LABELS[metric]}`);
  }, [data, metric, height]);

  return (
    <div className={cn('relative', className)}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        className="overflow-visible"
        role="img"
        aria-label={`Horizontal bar chart comparing campaigns by ${METRIC_LABELS[metric]}`}
      />
    </div>
  );
}
