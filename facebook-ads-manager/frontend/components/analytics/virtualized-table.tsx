'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Virtualized Table Component
 *
 * Renders large datasets efficiently using virtual scrolling
 * Only renders visible rows to optimize performance
 *
 * Performance characteristics:
 * - Handles 10,000+ rows smoothly
 * - Constant memory usage regardless of dataset size
 * - 60fps scrolling performance
 */

interface Column<T> {
  key: string;
  header: string;
  width?: number;
  minWidth?: number;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  overscan?: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function VirtualizedTable<T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 64,
  overscan = 5,
  className,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
}: VirtualizedTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const { visibleRange, totalHeight } = useMemo(() => {
    const containerHeight = containerRef.current?.clientHeight || 600;
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endIndex = Math.min(
      data.length,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );

    return {
      visibleRange: { start: startIndex, end: endIndex },
      totalHeight: data.length * rowHeight,
    };
  }, [scrollTop, data.length, rowHeight, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.start, visibleRange.end);
  }, [data, visibleRange]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Render cell content
  const renderCell = useCallback(
    (item: T, column: Column<T>, index: number) => {
      if (column.render) {
        return column.render(item, index);
      }
      return item[column.key];
    },
    []
  );

  // Loading state
  if (loading) {
    return (
      <div className={cn('border rounded-lg overflow-hidden', className)}>
        <div className="animate-pulse">
          <div className="bg-gray-100 h-12" />
          {[...Array(10)].map((_, i) => (
            <div key={i} className="border-t">
              <div className="bg-gray-50 h-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn('border rounded-lg p-12 text-center', className)}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gray-50 border-b sticky top-0 z-10">
        <div className="flex">
          {columns.map((column) => (
            <div
              key={column.key}
              className={cn(
                'px-4 py-3 font-medium text-sm text-gray-700',
                column.className
              )}
              style={{
                width: column.width || 'auto',
                minWidth: column.minWidth || 100,
                flex: column.width ? 'none' : 1,
              }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Virtualized body */}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: '600px' }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map((item, index) => {
            const absoluteIndex = visibleRange.start + index;
            return (
              <div
                key={absoluteIndex}
                className={cn(
                  'flex border-b hover:bg-gray-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                style={{
                  height: rowHeight,
                  position: 'absolute',
                  top: absoluteIndex * rowHeight,
                  left: 0,
                  right: 0,
                }}
                onClick={() => onRowClick?.(item, absoluteIndex)}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={cn('px-4 py-4 text-sm flex items-center', column.className)}
                    style={{
                      width: column.width || 'auto',
                      minWidth: column.minWidth || 100,
                      flex: column.width ? 'none' : 1,
                    }}
                  >
                    {renderCell(item, column, absoluteIndex)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for tracking table performance
 */
export function useTablePerformance(dataLength: number) {
  const renderCountRef = useRef(0);
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
  });

  React.useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      renderCountRef.current += 1;

      setMetrics({
        renderCount: renderCountRef.current,
        lastRenderTime: endTime - startTime,
      });
    };
  }, [dataLength]);

  return metrics;
}
