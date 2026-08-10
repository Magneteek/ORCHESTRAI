"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Brain,
  FileText,
  LayoutDashboard,
  Settings,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and key metrics",
  },
  {
    title: "Campaigns",
    href: "/dashboard/campaigns",
    icon: Target,
    description: "Manage your campaigns",
  },
  {
    title: "Ad Sets",
    href: "/dashboard/ad-sets",
    icon: Users,
    description: "Configure targeting and budgets",
  },
  {
    title: "Ads",
    href: "/dashboard/ads",
    icon: FileText,
    description: "Creative and ad management",
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "Performance insights",
  },
  {
    title: "AI Insights",
    href: "/dashboard/ai-insights",
    icon: Brain,
    description: "AI-powered recommendations",
  },
  {
    title: "Reporting",
    href: "/dashboard/reporting",
    icon: TrendingUp,
    description: "Custom reports and exports",
  },
  {
    title: "Automation",
    href: "/dashboard/automation",
    icon: Zap,
    description: "Rules and automated actions",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Account and preferences",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="h-8 w-8 rounded-lg bg-facebook" />
          <span className="text-lg font-bold">Ads Manager</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                    aria-label={item.description}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-medium">Need Help?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check our documentation or contact support
            </p>
            <Link href="/dashboard/support">
              <button className="mt-2 w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                Get Support
              </button>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
