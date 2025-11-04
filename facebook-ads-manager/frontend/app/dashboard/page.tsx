import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Eye,
  MousePointerClick,
  TrendingUp
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
        <p className="text-muted-foreground">
          Here is an overview of your advertising performance
        </p>
      </div>

      {/* Date Range Tabs */}
      <Tabs defaultValue="7days" className="w-full">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
          <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
          <TabsTrigger value="custom">Custom Range</TabsTrigger>
        </TabsList>

        <TabsContent value="7days" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Spend */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,543.00</div>
                <div className="flex items-center gap-1 text-xs text-success">
                  <ArrowDown className="h-3 w-3" />
                  <span>-8.5% from last period</span>
                </div>
              </CardContent>
            </Card>

            {/* Impressions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234,567</div>
                <div className="flex items-center gap-1 text-xs text-success">
                  <ArrowUp className="h-3 w-3" />
                  <span>+12.3% from last period</span>
                </div>
              </CardContent>
            </Card>

            {/* Clicks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24,567</div>
                <div className="flex items-center gap-1 text-xs text-success">
                  <ArrowUp className="h-3 w-3" />
                  <span>+5.2% from last period</span>
                </div>
              </CardContent>
            </Card>

            {/* ROAS */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROAS</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.25x</div>
                <div className="flex items-center gap-1 text-xs text-success">
                  <ArrowUp className="h-3 w-3" />
                  <span>+18.7% from last period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>
                  Your top performing campaigns this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Summer Sale 2025", status: "active", spend: "$3,245", roas: "5.2x" },
                    { name: "Product Launch Q1", status: "active", spend: "$2,890", roas: "4.8x" },
                    { name: "Brand Awareness", status: "active", spend: "$2,150", roas: "3.9x" },
                    { name: "Retargeting Campaign", status: "paused", spend: "$1,890", roas: "6.1x" },
                  ].map((campaign, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{campaign.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={campaign.status === "active" ? "active" : "paused"}>
                            {campaign.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Spend: {campaign.spend}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{campaign.roas}</p>
                        <p className="text-xs text-muted-foreground">ROAS</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>
                  Optimization suggestions for your campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Increase Budget",
                      description: "Summer Sale campaign showing strong ROAS",
                      impact: "high",
                    },
                    {
                      title: "Pause Underperforming Ad",
                      description: "Ad #1234 has low CTR and high CPC",
                      impact: "medium",
                    },
                    {
                      title: "Adjust Targeting",
                      description: "Expand age range for better reach",
                      impact: "medium",
                    },
                    {
                      title: "Update Creative",
                      description: "Test new ad variations",
                      impact: "low",
                    },
                  ].map((rec, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {rec.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            rec.impact === "high"
                              ? "success"
                              : rec.impact === "medium"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {rec.impact}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
