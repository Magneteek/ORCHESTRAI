/**
 * AI Insights Dashboard
 * Real-time AI analysis, predictions, and recommendations
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAdAccount } from '@/lib/hooks/use-ad-account';
import { useCurrency } from '@/lib/hooks/use-currency';
import {
  TrendingUp,
  AlertTriangle,
  Target,
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Brain,
  BarChart3,
  Users,
} from 'lucide-react';

export default function AIInsightsPage() {
  const { selectedAccountId } = useAdAccount();
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'predictions' | 'anomalies' | 'copy' | 'audience'>(
    'predictions'
  );

  // Sync with global ad account selector
  useEffect(() => {
    if (selectedAccountId && !selectedAccount) {
      setSelectedAccount(selectedAccountId);
    }
  }, [selectedAccountId, selectedAccount]);

  // Fetch real ad accounts
  const { data: adAccounts } = useQuery({
    queryKey: ['ad-accounts-ai'],
    queryFn: async () => {
      const res = await fetch('/api/ad-accounts');
      const json = await res.json();
      return json.data || [];
    },
  });

  // Fetch predictions
  const { data: predictionsData, isLoading: predictionsLoading } = useQuery({
    queryKey: ['ai-predictions', selectedAccount],
    queryFn: async () => {
      if (!selectedAccount) return null;
      const res = await axios.get(`/api/ai/predict?adAccountId=${selectedAccount}`);
      return res.data;
    },
    enabled: !!selectedAccount && activeTab === 'predictions',
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch anomalies
  const { data: anomaliesData, refetch: refetchAnomalies } = useQuery({
    queryKey: ['ai-anomalies', selectedAccount],
    queryFn: async () => {
      if (!selectedAccount) return null;
      const res = await axios.get(`/api/ai/anomalies?adAccountId=${selectedAccount}&hours=24`);
      return res.data;
    },
    enabled: !!selectedAccount && activeTab === 'anomalies',
    refetchInterval: 240000, // Refresh every 4 minutes
  });

  // Fetch audience insights
  const { data: audienceData, isLoading: audienceLoading } = useQuery({
    queryKey: ['ai-audience', selectedAccount],
    queryFn: async () => {
      if (!selectedAccount) return null;
      const res = await axios.get(
        `/api/ai/audience-insights?adAccountId=${selectedAccount}&checkFatigue=true`
      );
      return res.data;
    },
    enabled: !!selectedAccount && activeTab === 'audience',
  });

  // Fetch copy optimizations
  const { data: copyData, isLoading: copyLoading } = useQuery({
    queryKey: ['ai-copy', selectedAccount],
    queryFn: async () => {
      if (!selectedAccount) return null;
      const res = await axios.get(`/api/ai/optimize-copy?adAccountId=${selectedAccount}`);
      return res.data;
    },
    enabled: !!selectedAccount && activeTab === 'copy',
  });

  // Trigger immediate prediction
  const predictMutation = useMutation({
    mutationFn: async () => {
      return await axios.post('/api/ai/predict', {
        adAccountId: selectedAccount,
        predictionDays: 7,
      });
    },
  });

  // Trigger anomaly detection
  const anomalyMutation = useMutation({
    mutationFn: async () => {
      return await axios.post('/api/ai/anomalies', {
        adAccountId: selectedAccount,
      });
    },
    onSuccess: () => {
      refetchAnomalies();
    },
  });

  // Trigger copy optimization and audience analysis. Both tabs only ever GET
  // stored results, so without these the newest analysis a user could see was
  // whatever a cron run happened to leave behind — the copy tab was showing a
  // result from June with no control able to replace it.
  const copyMutation = useMutation({
    mutationFn: async () => {
      return await axios.post('/api/ai/optimize-copy', {
        adAccountId: selectedAccount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-copy', selectedAccount] });
    },
  });

  const audienceMutation = useMutation({
    mutationFn: async () => {
      return await axios.post('/api/ai/audience-insights', {
        adAccountId: selectedAccount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-audience', selectedAccount] });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
        </div>
        <p className="text-gray-600">
          AI-powered performance predictions, anomaly detection, and optimization recommendations
        </p>
      </div>

      {/* Account Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Ad Account
        </label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Choose an account...</option>
          {(adAccounts || []).map((account: any) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedAccount ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Select an Account to Begin
          </h3>
          <p className="text-gray-500">
            Choose an ad account above to view AI-powered insights and recommendations
          </p>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <TabButton
                  active={activeTab === 'predictions'}
                  onClick={() => setActiveTab('predictions')}
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Performance Predictions"
                />
                <TabButton
                  active={activeTab === 'anomalies'}
                  onClick={() => setActiveTab('anomalies')}
                  icon={<AlertTriangle className="w-5 h-5" />}
                  label="Anomaly Detection"
                  badge={anomaliesData?.alerts?.length}
                />
                <TabButton
                  active={activeTab === 'copy'}
                  onClick={() => setActiveTab('copy')}
                  icon={<FileText className="w-5 h-5" />}
                  label="Copy Optimization"
                />
                <TabButton
                  active={activeTab === 'audience'}
                  onClick={() => setActiveTab('audience')}
                  icon={<Users className="w-5 h-5" />}
                  label="Audience Insights"
                />
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Predictions Tab */}
            {activeTab === 'predictions' && (
              <PredictionsTab
                data={predictionsData}
                loading={predictionsLoading}
                onRefresh={() => predictMutation.mutate()}
                refreshing={predictMutation.isPending}
              />
            )}

            {/* Anomalies Tab */}
            {activeTab === 'anomalies' && (
              <AnomaliesTab
                data={anomaliesData}
                onRefresh={() => anomalyMutation.mutate()}
                refreshing={anomalyMutation.isPending}
              />
            )}

            {/* Copy Optimization Tab */}
            {activeTab === 'copy' && (
              <CopyOptimizationTab
                data={copyData}
                loading={copyLoading}
                onRefresh={() => copyMutation.mutate()}
                refreshing={copyMutation.isPending}
                error={copyMutation.error as any}
              />
            )}

            {/* Audience Insights Tab */}
            {activeTab === 'audience' && (
              <AudienceInsightsTab
                data={audienceData}
                loading={audienceLoading}
                onRefresh={() => audienceMutation.mutate()}
                refreshing={audienceMutation.isPending}
                error={audienceMutation.error as any}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
        ${
          active
            ? 'border-purple-500 text-purple-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }
      `}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

// Predictions Tab Component
function PredictionsTab({
  data,
  loading,
  onRefresh,
  refreshing,
}: {
  data: any;
  loading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const { format: formatCurrency } = useCurrency();
  if (loading) {
    return <LoadingState message="Loading predictions..." />;
  }

  if (!data?.predictions || data.predictions.length === 0) {
    return (
      <EmptyState
        icon={<TrendingUp className="w-12 h-12 text-gray-400" />}
        title="No Predictions Yet"
        description="Generate your first performance prediction to see AI-powered forecasts"
        action={
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {refreshing ? 'Generating...' : 'Generate Prediction'}
          </button>
        }
      />
    );
  }

  const latestPrediction = data.predictions[0];
  const insights = latestPrediction.insights;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Performance Predictions</h2>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {new Date(latestPrediction.analyzedAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Confidence Score */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Prediction Confidence</h3>
            <p className="text-sm text-gray-600">{insights.summary}</p>
            {insights.combinedOutcome && (
              <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  If everything below is done
                </div>
                <p className="mt-1 text-sm text-gray-800">{insights.combinedOutcome}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Individual values below overlap and are not additive.
                </p>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-purple-600">
              {(latestPrediction.confidence * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-500">Confidence Level</div>
            {insights.confidenceRationale && (
              <p className="mt-2 max-w-xs text-xs text-gray-500">
                {insights.confidenceRationale}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Predictions Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Forecast</h3>
        <div className="space-y-4">
          {insights.predictions.map((pred: any, index: number) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{pred.date}</div>
                <div className="text-sm text-gray-500">Day {index + 1}</div>
              </div>
              <div className="grid grid-cols-4 gap-6 flex-1">
                {/* A lead-gen forecast has no revenue, so a ROAS column would
                    read 0.00x on every row. Show the forecast that matters. */}
                {pred.conversions !== undefined ? (
                  <MetricDisplay label="Leads" value={pred.conversions.toLocaleString()} />
                ) : (
                  <MetricDisplay label="ROAS" value={`${pred.roas.toFixed(2)}x`} />
                )}
                {pred.cpa !== undefined ? (
                  <MetricDisplay label="Cost/lead" value={formatCurrency(pred.cpa)} />
                ) : (
                  <MetricDisplay label="CTR" value={`${(pred.ctr * 100).toFixed(2)}%`} />
                )}
                <MetricDisplay label="Spend" value={formatCurrency(pred.spend)} />
                <MetricDisplay label="Clicks" value={pred.clicks.toLocaleString()} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            {insights.recommendations.map((rec: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg"
              >
                <div
                  className={`p-2 rounded-lg ${
                    rec.impact === 'high'
                      ? 'bg-green-500'
                      : rec.impact === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                  }`}
                >
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {rec.priority ? (
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
                        {rec.priority}
                      </span>
                    ) : null}
                    {rec.action}
                  </div>
                  {(rec.monthlyValue || rec.effort || rec.where) && (
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                      {rec.monthlyValue && (
                        <span>
                          <span className="font-medium">Worth:</span> {rec.monthlyValue}
                          {rec.valueBasis && rec.valueBasis !== 'not_quantifiable' && (
                            <span className="ml-1 text-gray-400">
                              ({rec.valueBasis.replace(/_/g, ' ')})
                            </span>
                          )}
                        </span>
                      )}
                      {rec.evidenceStrength && (
                        <span
                          className={
                            rec.evidenceStrength === 'strong'
                              ? 'text-emerald-700'
                              : rec.evidenceStrength === 'speculative'
                              ? 'text-amber-700'
                              : 'text-gray-600'
                          }
                        >
                          <span className="font-medium">Evidence:</span> {rec.evidenceStrength}
                        </span>
                      )}
                      {rec.effort && <span><span className="font-medium">Effort:</span> {rec.effort}</span>}
                      {rec.where && <span><span className="font-medium">Where:</span> {rec.where}</span>}
                      {rec.dependsOn ? <span className="text-amber-700">After step {rec.dependsOn}</span> : null}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 mt-1">{rec.description}</div>
                  {rec.expectedEffect && (
                    <div className="text-sm text-gray-800 mt-2">
                      <span className="font-medium">Expected:</span> {rec.expectedEffect}
                    </div>
                  )}
                  {rec.verifyBy && (
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Verify:</span> {rec.verifyBy}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Impact: <span className="font-semibold">{rec.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Anomalies Tab Component
function AnomaliesTab({
  data,
  onRefresh,
  refreshing,
}: {
  data: any;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  if (!data) {
    return <LoadingState message="Loading anomalies..." />;
  }

  const hasAnomalies = data.anomalies && data.anomalies.length > 0;
  const latestResult = hasAnomalies ? data.anomalies[0] : null;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className={`rounded-lg p-6 ${
        latestResult?.overallStatus === 'critical' ? 'bg-red-50' :
        latestResult?.overallStatus === 'warning' ? 'bg-yellow-50' :
        'bg-green-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {latestResult?.overallStatus === 'critical' ? (
              <XCircle className="w-8 h-8 text-red-600" />
            ) : latestResult?.overallStatus === 'warning' ? (
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-600" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                System Status: {latestResult?.overallStatus || 'Healthy'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {latestResult?.summary || 'All metrics within normal range'}
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {refreshing ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>
      </div>

      {/* Anomalies List */}
      {latestResult?.anomalies && latestResult.anomalies.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Anomalies</h3>
          <div className="space-y-4">
            {latestResult.anomalies.map((anomaly: any, index: number) => (
              <div
                key={index}
                className={`p-4 border-l-4 rounded-r-lg ${
                  anomaly.severity === 'critical'
                    ? 'border-red-500 bg-red-50'
                    : anomaly.severity === 'moderate'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {anomaly.metric.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          anomaly.severity === 'critical'
                            ? 'bg-red-200 text-red-800'
                            : anomaly.severity === 'moderate'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}
                      >
                        {anomaly.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{anomaly.description}</p>

                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">Current:</span>
                        <span className="ml-2 font-semibold">{anomaly.currentValue.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expected:</span>
                        <span className="ml-2 font-semibold">{anomaly.expectedValue.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Deviation:</span>
                        <span className="ml-2 font-semibold text-red-600">
                          {anomaly.deviation.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {anomaly.likelyCauses && anomaly.likelyCauses.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Likely Causes:</div>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {anomaly.likelyCauses.map((cause: string, i: number) => (
                            <li key={i}>{cause}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {anomaly.recommendations && anomaly.recommendations.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Recommended Actions:</div>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {anomaly.recommendations.map((rec: string, i: number) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detection Status */}
      {data.status && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detection Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusCard
              label="Last Run"
              value={
                data.status.lastRun
                  ? new Date(data.status.lastRun).toLocaleString()
                  : 'Never'
              }
              icon={<Clock className="w-5 h-5 text-gray-400" />}
            />
            <StatusCard
              label="Next Run"
              value={
                data.status.nextRun
                  ? new Date(data.status.nextRun).toLocaleString()
                  : 'Not scheduled'
              }
              icon={<Clock className="w-5 h-5 text-blue-400" />}
            />
            <StatusCard
              label="Recent Anomalies"
              value={data.status.recentAnomalies || 0}
              icon={<BarChart3 className="w-5 h-5 text-yellow-400" />}
            />
            <StatusCard
              label="Critical"
              value={data.status.criticalAnomalies || 0}
              icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Copy Optimization Tab Component
function CopyOptimizationTab({
  data,
  loading,
  onRefresh,
  refreshing,
  error,
}: {
  data: any;
  loading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
  error?: { response?: { data?: { error?: string; message?: string } } };
}) {
  if (loading) {
    return <LoadingState message="Loading copy optimizations..." />;
  }

  if (!data?.optimizations || data.optimizations.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-12 h-12 text-gray-400" />}
        title="No Copy Optimizations"
        description="Analyse the highest-spending ad's copy to see AI-powered suggestions"
        action={
          <GenerateButton
            onClick={onRefresh}
            refreshing={refreshing}
            label="Analyse Ad Copy"
            error={error}
          />
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Optimizations</h3>
          <GenerateButton
            onClick={onRefresh}
            refreshing={refreshing}
            label="Analyse Again"
            error={error}
          />
        </div>
        <div className="space-y-4">
          {data.optimizations.map((opt: any, index: number) => (
            <div key={opt.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-gray-900">Optimization #{index + 1}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(opt.analyzedAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-purple-600 font-semibold">
                  {(opt.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>
              <div className="text-sm text-gray-700">
                {opt.insights?.summary || 'Copy optimization analysis completed'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Audience Insights Tab Component
function AudienceInsightsTab({
  data,
  loading,
  onRefresh,
  refreshing,
  error,
}: {
  data: any;
  loading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
  error?: { response?: { data?: { error?: string; message?: string } } };
}) {
  const { format: formatCurrency } = useCurrency();

  if (loading) {
    return <LoadingState message="Loading audience insights..." />;
  }

  if (!data?.insights || data.insights.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-12 h-12 text-gray-400" />}
        title="No Audience Insights"
        description="Generate audience insights to see targeting recommendations"
        action={
          <GenerateButton
            onClick={onRefresh}
            refreshing={refreshing}
            label="Generate Insights"
            error={error}
          />
        }
      />
    );
  }

  const latestInsights = data.insights[0];
  const analysis = latestInsights.insights ?? {};

  // Segments carry roas on a sales account and cpa on a lead-gen one, never
  // both. Render whichever arrived rather than a 0.00x column of nothing.
  const efficiency = (seg: any) =>
    seg.cpa !== undefined
      ? { label: 'Cost/lead', value: formatCurrency(seg.cpa) }
      : seg.roas !== undefined
      ? { label: 'ROAS', value: `${seg.roas.toFixed(2)}x` }
      : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Latest Analysis</h3>
          <GenerateButton
            onClick={onRefresh}
            refreshing={refreshing}
            label="Regenerate"
            error={error}
          />
        </div>
        <div className="text-sm text-gray-600">
          {analysis.summary || 'Audience analysis completed'}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Analyzed: {new Date(latestInsights.analyzedAt).toLocaleString()}
        </div>
      </div>

      {/* Top performing segments. The analysis has always produced these; the
          tab rendered only the prose summary, so they were never visible. */}
      {analysis.topPerformingSegments?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Segments</h3>
          <div className="space-y-3">
            {analysis.topPerformingSegments.map((seg: any, i: number) => (
              <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {seg.segment}
                      <span className="ml-2 text-xs uppercase tracking-wide text-gray-400">
                        {seg.type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{seg.insight}</div>
                  </div>
                  <div className="flex gap-6">
                    <MetricDisplay label="Spend" value={formatCurrency(seg.spend)} />
                    <MetricDisplay label="Conversions" value={String(seg.conversions ?? 0)} />
                    {efficiency(seg) && (
                      <MetricDisplay
                        label={efficiency(seg)!.label}
                        value={efficiency(seg)!.value}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Underperforming segments */}
      {analysis.underperformingSegments?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Underperforming Segments</h3>
          <div className="space-y-3">
            {analysis.underperformingSegments.map((seg: any, i: number) => (
              <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {seg.segment}
                      <span className="ml-2 text-xs uppercase tracking-wide text-gray-400">
                        {seg.type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{seg.issue}</div>
                    <div className="text-sm text-gray-800 mt-1">
                      <span className="font-medium">Fix:</span> {seg.recommendation}
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <MetricDisplay label="Spend" value={formatCurrency(seg.spend)} />
                    {efficiency(seg) && (
                      <MetricDisplay
                        label={efficiency(seg)!.label}
                        value={efficiency(seg)!.value}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expansion opportunities */}
      {analysis.expansionOpportunities?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expansion Opportunities</h3>
          <div className="space-y-3">
            {analysis.expansionOpportunities.map((opp: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{opp.opportunity}</div>
                  <div className="text-sm text-gray-600 mt-1">{opp.reasoning}</div>
                  <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-gray-600">
                    <span><span className="font-medium">Segment:</span> {opp.segment}</span>
                    {opp.expectedCpa !== undefined && (
                      <span>
                        <span className="font-medium">Expected cost/lead:</span>{' '}
                        {formatCurrency(opp.expectedCpa)}
                      </span>
                    )}
                    {opp.expectedRoas !== undefined && (
                      <span>
                        <span className="font-medium">Expected ROAS:</span>{' '}
                        {opp.expectedRoas.toFixed(2)}x
                      </span>
                    )}
                    <span><span className="font-medium">Risk:</span> {opp.riskLevel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Targeting recommendations */}
      {analysis.targetingRecommendations?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Targeting Recommendations</h3>
          <div className="space-y-3">
            {analysis.targetingRecommendations.map((rec: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div
                  className={`p-2 rounded-lg ${
                    rec.impact === 'high'
                      ? 'bg-green-500'
                      : rec.impact === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                  }`}
                >
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{rec.action}</div>
                  <div className="text-sm text-gray-600 mt-1">{rec.description}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Impact: <span className="font-semibold">{rec.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audience Fatigue */}
      {data.fatigueAnalysis && data.fatigueAnalysis.isFatigued && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-2">
                Audience Fatigue Detected: {data.fatigueAnalysis.fatigueLevel}
              </h4>
              <ul className="space-y-1 text-sm text-yellow-800">
                {data.fatigueAnalysis.indicators.map((indicator: string, i: number) => (
                  <li key={i}>• {indicator}</li>
                ))}
              </ul>
              {data.fatigueAnalysis.recommendations && (
                <div className="mt-3">
                  <div className="font-medium text-yellow-900 mb-1">Recommendations:</div>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    {data.fatigueAnalysis.recommendations.map((rec: string, i: number) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function LoadingState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      <RefreshCw className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      <div className="mx-auto mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {action}
    </div>
  );
}

/**
 * Generate/refresh control for the tabs that produce an analysis on demand.
 * Surfaces the route's own error text: these calls take real money and real
 * time, so a silent no-op is worse than a visible reason.
 */
function GenerateButton({
  onClick,
  refreshing,
  label,
  error,
}: {
  onClick: () => void;
  refreshing: boolean;
  label: string;
  error?: { response?: { data?: { error?: string; message?: string } } };
}) {
  const reason = error?.response?.data?.message || error?.response?.data?.error;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={onClick}
        disabled={refreshing}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Analysing...' : label}
      </button>
      {reason && <span className="text-xs text-red-600 max-w-xs text-right">{reason}</span>}
    </div>
  );
}

function MetricDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function StatusCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
      {icon}
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm font-semibold text-gray-900 mt-1">{value}</div>
      </div>
    </div>
  );
}
