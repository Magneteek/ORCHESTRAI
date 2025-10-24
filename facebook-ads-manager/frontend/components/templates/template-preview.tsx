'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatPercentage, formatDate } from '@/lib/utils/format';
import { TrendingUp, Target, Users, Calendar, Eye } from 'lucide-react';
import type { AdTemplate } from '@prisma/client';

interface TemplatePreviewProps {
  template: (AdTemplate & {
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
  }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate: (template: AdTemplate) => void;
}

export function TemplatePreview({ template, open, onOpenChange, onUseTemplate }: TemplatePreviewProps) {
  if (!template) return null;

  const adCopy = template.adCopy as any;
  const creativeSpecs = template.creativeSpecs as any;
  const targetingConfig = template.targetingConfig as any;
  const campaignStructure = template.campaignStructure as any;
  const performance = template.performanceAggregate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl">{template.name}</DialogTitle>
              <DialogDescription>{template.description}</DialogDescription>
            </div>
            <Badge variant={template.isPublic ? 'default' : 'secondary'}>
              {template.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="adcopy">Ad Copy</TabsTrigger>
            <TabsTrigger value="targeting">Targeting</TabsTrigger>
            <TabsTrigger value="campaign">Campaign</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="capitalize">
                    {template.category.replace(/-/g, ' ')}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Objective</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="capitalize">
                    {template.objective.replace('OUTCOME_', '').toLowerCase()}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{formatDate(template.createdAt, 'short')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{template.timesUsed} times</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ad Copy Tab */}
          <TabsContent value="adcopy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ad Copy</CardTitle>
                <CardDescription>Headlines, text, and call-to-action</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Headline</label>
                  <p className="mt-1 text-base font-semibold">{adCopy?.headline}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Primary Text</label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{adCopy?.primaryText}</p>
                </div>

                {adCopy?.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="mt-1 text-sm">{adCopy.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Call to Action</label>
                  <Badge className="mt-1">{adCopy?.callToAction}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Creative Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Format:</span>
                    <span className="ml-2 font-medium capitalize">{creativeSpecs?.format}</span>
                  </div>
                  {creativeSpecs?.dimensions && (
                    <div>
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span className="ml-2 font-medium">
                        {creativeSpecs.dimensions.width}x{creativeSpecs.dimensions.height}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Targeting Tab */}
          <TabsContent value="targeting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Targeting Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {targetingConfig?.demographics && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Demographics</label>
                    <div className="mt-2 space-y-1 text-sm">
                      {targetingConfig.demographics.ageMin && targetingConfig.demographics.ageMax && (
                        <p>Age: {targetingConfig.demographics.ageMin}-{targetingConfig.demographics.ageMax}</p>
                      )}
                      {targetingConfig.demographics.genders && (
                        <p>Genders: {targetingConfig.demographics.genders.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}

                {targetingConfig?.interests && targetingConfig.interests.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Interests</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {targetingConfig.interests.map((interest: string, idx: number) => (
                        <Badge key={idx} variant="outline">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {targetingConfig?.behaviors && targetingConfig.behaviors.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Behaviors</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {targetingConfig.behaviors.map((behavior: string, idx: number) => (
                        <Badge key={idx} variant="outline">{behavior}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {targetingConfig?.locations && targetingConfig.locations.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Locations</label>
                    <div className="mt-2 space-y-1 text-sm">
                      {targetingConfig.locations.map((location: any, idx: number) => (
                        <p key={idx}>
                          {location.city && `${location.city}, `}
                          {location.region && `${location.region}, `}
                          {location.country}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaign Tab */}
          <TabsContent value="campaign" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Budget</label>
                    <p className="mt-1 text-lg font-semibold">
                      {formatCurrency(campaignStructure?.budget)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bid Strategy</label>
                    <p className="mt-1 font-medium capitalize">
                      {campaignStructure?.bidStrategy?.replace(/_/g, ' ').toLowerCase()}
                    </p>
                  </div>
                </div>

                {campaignStructure?.placements && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Placements</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {campaignStructure.placements.map((placement: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="capitalize">
                          {placement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {campaignStructure?.schedule && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Schedule</label>
                    <div className="mt-2 space-y-1 text-sm">
                      {campaignStructure.schedule.startDate && (
                        <p>Start: {formatDate(campaignStructure.schedule.startDate, 'short')}</p>
                      )}
                      {campaignStructure.schedule.endDate && (
                        <p>End: {formatDate(campaignStructure.schedule.endDate, 'short')}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            {performance ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {performance.avgRoas !== null && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          ROAS
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{formatNumber(performance.avgRoas, 2)}x</p>
                      </CardContent>
                    </Card>
                  )}

                  {performance.avgCtr !== null && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">CTR</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{formatPercentage(performance.avgCtr)}</p>
                      </CardContent>
                    </Card>
                  )}

                  {performance.avgCpc !== null && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Avg CPC</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(performance.avgCpc)}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Accounts Using
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{performance.accountsUsing}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Aggregated Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Spend:</span>
                        <span className="ml-2 font-medium">{formatCurrency(performance.totalSpend)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Impressions:</span>
                        <span className="ml-2 font-medium">{formatNumber(Number(performance.totalImpressions))}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Clicks:</span>
                        <span className="ml-2 font-medium">{formatNumber(Number(performance.totalClicks))}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Conversions:</span>
                        <span className="ml-2 font-medium">{formatNumber(Number(performance.totalConversions))}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No performance data available yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Performance metrics will appear after the template is used
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onUseTemplate(template)}>
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
