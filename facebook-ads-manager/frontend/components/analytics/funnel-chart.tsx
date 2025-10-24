'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';
import type { FunnelStage } from '@/types/analytics';

interface FunnelChartProps {
  data: FunnelStage[];
  height?: number;
  className?: string;
}

export function FunnelChart({ data, height = 400, className }: FunnelChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const width = svgRef.current.clientWidth;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate funnel stage dimensions
    const stageHeight = innerHeight / data.length;
    const maxWidth = innerWidth * 0.8;
    const minWidth = innerWidth * 0.3;

    // Color scale
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, data.length - 1])
      .range(['#3b82f6', '#8b5cf6']);

    // Calculate widths based on values
    const maxValue = data[0]?.value || 1;
    const widthScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([minWidth, maxWidth]);

    // Create funnel stages
    data.forEach((stage, index) => {
      const stageWidth = widthScale(stage.value);
      const nextStageWidth = index < data.length - 1
        ? widthScale(data[index + 1].value)
        : stageWidth * 0.8;

      const yPos = index * stageHeight;
      const xOffset = (innerWidth - stageWidth) / 2;
      const nextXOffset = (innerWidth - nextStageWidth) / 2;

      // Create gradient for stage
      const gradient = svg
        .append('defs')
        .append('linearGradient')
        .attr('id', `funnel-gradient-${index}`)
        .attr('x1', '0%')
        .attr('x2', '0%')
        .attr('y1', '0%')
        .attr('y2', '100%');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScale(index))
        .attr('stop-opacity', 0.9);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScale(index))
        .attr('stop-opacity', 0.7);

      // Draw trapezoid
      const points = [
        [xOffset, yPos],
        [xOffset + stageWidth, yPos],
        [nextXOffset + nextStageWidth, yPos + stageHeight],
        [nextXOffset, yPos + stageHeight],
      ];

      const stageGroup = g.append('g').attr('class', 'funnel-stage');

      stageGroup
        .append('path')
        .attr('d', d3.line()(points as [number, number][]))
        .attr('fill', `url(#funnel-gradient-${index})`)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.8);
        })
        .on('mouseleave', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1);
        });

      // Add stage label
      stageGroup
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', yPos + stageHeight / 2 - 10)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-sm font-semibold')
        .attr('fill', 'white')
        .text(stage.name);

      // Add value
      stageGroup
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', yPos + stageHeight / 2 + 10)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-lg font-bold')
        .attr('fill', 'white')
        .text(stage.value.toLocaleString());

      // Add percentage
      stageGroup
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', yPos + stageHeight / 2 + 28)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-xs')
        .attr('fill', 'white')
        .attr('opacity', 0.9)
        .text(`${stage.percentage.toFixed(1)}%`);

      // Add dropoff rate between stages
      if (index < data.length - 1 && stage.dropoffRate !== undefined) {
        const dropoffLabel = g.append('g');

        dropoffLabel
          .append('rect')
          .attr('x', innerWidth + 10)
          .attr('y', yPos + stageHeight - 15)
          .attr('width', 100)
          .attr('height', 30)
          .attr('fill', stage.dropoffRate > 50 ? '#ef4444' : '#f59e0b')
          .attr('rx', 4)
          .attr('opacity', 0.9);

        dropoffLabel
          .append('text')
          .attr('x', innerWidth + 60)
          .attr('y', yPos + stageHeight)
          .attr('text-anchor', 'middle')
          .attr('class', 'text-xs font-medium')
          .attr('fill', 'white')
          .text(`-${stage.dropoffRate.toFixed(1)}%`);

        dropoffLabel
          .append('text')
          .attr('x', innerWidth + 60)
          .attr('y', yPos + stageHeight + 12)
          .attr('text-anchor', 'middle')
          .attr('class', 'text-[10px]')
          .attr('fill', 'white')
          .attr('opacity', 0.8)
          .text('drop-off');

        // Add connecting line
        g.append('line')
          .attr('x1', innerWidth + 5)
          .attr('y1', yPos + stageHeight)
          .attr('x2', innerWidth + 10)
          .attr('y2', yPos + stageHeight)
          .attr('stroke', 'currentColor')
          .attr('stroke-width', 1)
          .attr('opacity', 0.3)
          .attr('stroke-dasharray', '2,2');
      }
    });

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-base font-bold')
      .attr('fill', 'currentColor')
      .text('Conversion Funnel');
  }, [data, height]);

  return (
    <div className={cn('relative', className)}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        className="overflow-visible"
        role="img"
        aria-label="Conversion funnel chart showing drop-off rates at each stage"
      />
    </div>
  );
}
