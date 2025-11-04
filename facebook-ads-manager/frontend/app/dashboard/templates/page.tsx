'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, LayoutGrid, List, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateCard } from '@/components/templates/template-card';
import { TemplateLeaderboard } from '@/components/templates/template-leaderboard';
import { TemplateFilters } from '@/components/templates/template-filters';
import { TemplatePreview } from '@/components/templates/template-preview';
import { UseTemplateWizard } from '@/components/templates/use-template-wizard';
import { apiClient } from '@/lib/helpers/api-client';
import type { AdTemplate } from '@prisma/client';

interface TemplatesResponse {
  data: (AdTemplate & {
    performanceAggregate?: {
      avgRoas: number | null;
      avgCtr: number | null;
      avgCpc: number | null;
      avgCpm: number | null;
      totalSpend: number;
      totalImpressions: bigint;
      totalClicks: bigint;
      totalConversions: bigint;
      accountsUsing: number;
    } | null;
  })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    objective: 'all',
    visibility: 'all',
    sortBy: 'createdAt',
  });
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<typeof templates[0] | null>(null);
  const [showUseWizard, setShowUseWizard] = useState(false);

  // Fetch templates
  const { data, isLoading, error, refetch } = useQuery<TemplatesResponse>({
    queryKey: ['templates', search, filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.objective !== 'all' && { objective: filters.objective }),
        ...(filters.visibility !== 'all' && { visibility: filters.visibility }),
        sortBy: filters.sortBy,
        sortOrder: 'desc',
      });

      return apiClient.get<TemplatesResponse>(`/api/templates?${params}`);
    },
    staleTime: 30000,
  });

  // Fetch top templates for leaderboard
  const { data: topTemplates } = useQuery<typeof templates>({
    queryKey: ['templates', 'top'],
    queryFn: async () => {
      return apiClient.get<typeof templates>('/api/templates/leaderboard?limit=10');
    },
    staleTime: 60000,
  });

  const templates = data?.data || [];
  const pagination = data?.pagination;

  const handleUseTemplate = (template: typeof templates[0]) => {
    setSelectedTemplate(template);
    setShowUseWizard(true);
  };

  const handlePreview = (template: typeof templates[0]) => {
    setPreviewTemplate(template);
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      objective: 'all',
      visibility: 'all',
      sortBy: 'createdAt',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Marketplace</h1>
          <p className="text-muted-foreground">
            Browse and use proven ad templates for your campaigns
          </p>
        </div>
        <Link href="/dashboard/templates/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </Link>
      </div>

      {/* Tabs for Browse vs Leaderboard */}
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Browse Templates</TabsTrigger>
          <TabsTrigger value="leaderboard">Top Performers</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 rounded-md border p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
                {(filters.category !== 'all' ||
                  filters.objective !== 'all' ||
                  filters.visibility !== 'all') && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {
                      [filters.category, filters.objective, filters.visibility].filter(
                        (f) => f !== 'all'
                      ).length
                    }
                  </span>
                )}
              </Button>

              {/* Refresh */}
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 border-t pt-4">
                <TemplateFilters
                  filters={filters}
                  onChange={setFilters}
                  onReset={handleResetFilters}
                />
              </div>
            )}
          </Card>

          {/* Templates Grid/List */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading templates...
                </p>
              </div>
            </div>
          ) : error ? (
            <Card className="flex h-64 items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-destructive">
                  Error loading templates
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {error instanceof Error ? error.message : 'Unknown error'}
                </p>
                <Button onClick={() => refetch()} className="mt-4" size="sm">
                  Try Again
                </Button>
              </div>
            </Card>
          ) : templates.length === 0 ? (
            <Card className="flex h-64 items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold">No templates found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {search || Object.values(filters).some((f) => f !== 'all')
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first template'}
                </p>
                {!search && !Object.values(filters).some((f) => f !== 'all') && (
                  <Link href="/dashboard/templates/new">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Template
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUseTemplate={handleUseTemplate}
                    onPreview={handlePreview}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} templates
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          {topTemplates && topTemplates.length > 0 ? (
            <div className="space-y-6">
              <TemplateLeaderboard
                templates={topTemplates}
                metric="roas"
                onSelectTemplate={handlePreview}
              />
              <TemplateLeaderboard
                templates={topTemplates}
                metric="ctr"
                onSelectTemplate={handlePreview}
              />
              <TemplateLeaderboard
                templates={topTemplates}
                metric="usage"
                onSelectTemplate={handlePreview}
              />
            </div>
          ) : (
            <Card className="flex h-64 items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">
                  No performance data available yet
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      <TemplatePreview
        template={previewTemplate}
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        onUseTemplate={handleUseTemplate}
      />

      {/* Use Template Wizard */}
      <UseTemplateWizard
        template={selectedTemplate}
        open={showUseWizard}
        onOpenChange={setShowUseWizard}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
