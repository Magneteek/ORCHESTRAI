import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Brain, TrendingUp, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-facebook" />
            <h1 className="text-xl font-bold">Facebook Ads Manager</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button variant="facebook">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="mb-20 text-center">
          <h2 className="mb-4 text-5xl font-bold tracking-tight">
            AI-Powered Facebook Ads{" "}
            <span className="gradient-text">Optimization</span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            Maximize your advertising ROI with intelligent automation, real-time insights,
            and data-driven recommendations powered by advanced AI.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" variant="facebook" className="gap-2">
                Start Free Trial
                <Zap className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </Link>
          </div>
        </section>

        <section className="mb-20">
          <h3 className="mb-10 text-center text-3xl font-bold">
            Powerful Features for Better Results
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card-hover">
              <CardHeader>
                <Brain className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>AI Optimization</CardTitle>
                <CardDescription>
                  Automated budget allocation and bid optimization using machine learning
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <BarChart3 className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Real-Time Analytics</CardTitle>
                <CardDescription>
                  Track campaign performance with live dashboards and detailed insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <TrendingUp className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Performance Tracking</CardTitle>
                <CardDescription>
                  Monitor ROAS, CTR, conversions, and all key metrics in one place
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Zap className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Automated Actions</CardTitle>
                <CardDescription>
                  Set rules to pause underperforming ads and scale winning campaigns
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="mb-20">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">
                Ready to Transform Your Facebook Advertising?
              </CardTitle>
              <CardDescription className="text-lg">
                Join thousands of marketers who trust our platform to optimize their campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/signup">
                <Button size="lg" variant="facebook" className="gap-2">
                  Get Started for Free
                  <Zap className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">45%</div>
              <div className="text-sm text-muted-foreground">Average ROAS Improvement</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">30%</div>
              <div className="text-sm text-muted-foreground">Cost Per Acquisition Reduction</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">10x</div>
              <div className="text-sm text-muted-foreground">Faster Campaign Optimization</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Facebook Ads Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
