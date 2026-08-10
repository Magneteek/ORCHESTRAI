'use client';

import { BarChart3, FileText, Users, TrendingUp, Download, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const REPORT_TYPES = [
  {
    icon: TrendingUp,
    title: 'Performance Report',
    description: 'CTR, ROAS, CPC, CPM and conversion trends across all campaigns over a custom date range.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: BarChart3,
    title: 'Campaign Summary',
    description: 'Side-by-side comparison of campaign spend, impressions, clicks and results.',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    icon: FileText,
    title: 'Ad Creative Analysis',
    description: 'Which headlines, images and copy variations are driving the best engagement.',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    icon: Users,
    title: 'Audience Report',
    description: 'Demographic and interest breakdown of who is responding to your ads.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
];

export default function ReportingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reporting</h2>
        <p className="text-muted-foreground">Generate and export custom performance reports</p>
      </div>

      <Card className="border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-800">
            Custom reporting is coming soon. Reports will be exportable as PDF and CSV with scheduled delivery to your inbox.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {REPORT_TYPES.map((report) => (
          <Card key={report.title} className="p-6">
            <div className="flex items-start gap-4">
              <div className={`rounded-lg p-2 ${report.bg}`}>
                <report.icon className={`h-6 w-6 ${report.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{report.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
                <div className="mt-4 flex items-center gap-3">
                  <Button size="sm" disabled className="gap-2">
                    <Download className="h-4 w-4" />
                    Generate Report
                  </Button>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
