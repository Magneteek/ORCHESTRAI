import { NextRequest, NextResponse } from 'next/server';

/**
 * Performance Analytics Endpoint
 *
 * Receives and stores Core Web Vitals and custom performance metrics
 * Supports both POST (with body) and beacon (without body parsing)
 */

type PerformanceMetric = {
  metric: {
    name: string;
    value: number;
    rating?: 'good' | 'needs-improvement' | 'poor';
    delta?: number;
    navigationType?: string;
  };
  url: string;
  userAgent?: string;
  timestamp: number;
  sessionId: string;
};

// In-memory storage for development (replace with database in production)
const metricsStore: PerformanceMetric[] = [];
const MAX_METRICS = 10000;

export async function POST(request: NextRequest) {
  try {
    const metric: PerformanceMetric = await request.json();

    // Validate metric data
    if (!metric.metric || !metric.metric.name || typeof metric.metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Store metric (limit array size)
    metricsStore.push(metric);
    if (metricsStore.length > MAX_METRICS) {
      metricsStore.shift();
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance]', metric.metric.name, ':', metric.metric.value.toFixed(2));
    }

    // In production, send to analytics service
    // await sendToAnalyticsService(metric);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process performance metric:', error);
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const metricName = searchParams.get('metric');

    let filteredMetrics = metricsStore;

    // Filter by session ID
    if (sessionId) {
      filteredMetrics = filteredMetrics.filter(m => m.sessionId === sessionId);
    }

    // Filter by metric name
    if (metricName) {
      filteredMetrics = filteredMetrics.filter(m => m.metric.name === metricName);
    }

    // Calculate aggregations
    const aggregations = calculateAggregations(filteredMetrics);

    return NextResponse.json({
      metrics: filteredMetrics.slice(-100), // Return last 100 metrics
      aggregations,
      total: filteredMetrics.length,
    });
  } catch (error) {
    console.error('Failed to retrieve performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve metrics' },
      { status: 500 }
    );
  }
}

function calculateAggregations(metrics: PerformanceMetric[]) {
  const byMetric: Record<string, { values: number[]; ratings: Record<string, number> }> = {};

  metrics.forEach(m => {
    const name = m.metric.name;
    if (!byMetric[name]) {
      byMetric[name] = { values: [], ratings: { good: 0, 'needs-improvement': 0, poor: 0 } };
    }

    byMetric[name].values.push(m.metric.value);

    if (m.metric.rating) {
      byMetric[name].ratings[m.metric.rating]++;
    }
  });

  const aggregations: Record<string, any> = {};

  for (const [name, data] of Object.entries(byMetric)) {
    const values = data.values;
    const sorted = [...values].sort((a, b) => a - b);

    aggregations[name] = {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p75: sorted[Math.floor(sorted.length * 0.75)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      ratings: data.ratings,
    };
  }

  return aggregations;
}
