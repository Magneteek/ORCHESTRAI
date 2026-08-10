'use client';

import { Zap, PauseCircle, DollarSign, Clock, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RULE_TYPES = [
  {
    icon: DollarSign,
    title: 'Budget Rules',
    description: 'Automatically scale budgets up when ROAS exceeds your target, or pull back when it drops below threshold.',
    color: 'text-green-600',
    bg: 'bg-green-50',
    examples: ['Scale budget +20% if ROAS > 3x', 'Reduce budget -50% if CPA > $30'],
  },
  {
    icon: PauseCircle,
    title: 'Pause Rules',
    description: 'Pause underperforming ads, ad sets, or campaigns automatically based on spend and results.',
    color: 'text-red-600',
    bg: 'bg-red-50',
    examples: ['Pause ad if CTR < 0.5% after $10 spend', 'Pause campaign if daily budget is exhausted before noon'],
  },
  {
    icon: Zap,
    title: 'Bid Adjustments',
    description: 'Dynamically adjust bids based on time of day, audience performance, or competitive pressure.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    examples: ['Increase bid by 15% on weekends', 'Lower bid after 10pm'],
  },
  {
    icon: Clock,
    title: 'Scheduled Actions',
    description: 'Set campaigns to activate and pause on a schedule — for sales events, seasonal promotions, and dayparting.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    examples: ['Activate summer sale campaign on June 21', 'Pause all ads on Christmas Day'],
  },
];

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Automation</h2>
        <p className="text-muted-foreground">Rules-based automation to manage campaigns on autopilot</p>
      </div>

      <Card className="border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Automation rules let you automatically manage your campaigns based on performance thresholds — no more manual checking. Rules run every hour against live Facebook data. <strong>Coming in the next release.</strong>
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {RULE_TYPES.map((rule) => (
          <Card key={rule.title} className="p-6">
            <div className="flex items-start gap-4">
              <div className={`rounded-lg p-2 ${rule.bg}`}>
                <rule.icon className={`h-6 w-6 ${rule.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{rule.title}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Coming Soon
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{rule.description}</p>
                <ul className="mt-3 space-y-1">
                  {rule.examples.map((ex) => (
                    <li key={ex} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                      {ex}
                    </li>
                  ))}
                </ul>
                <Button size="sm" disabled className="mt-4">
                  Create Rule
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
