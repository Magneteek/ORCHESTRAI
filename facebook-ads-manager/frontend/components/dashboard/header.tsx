"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Facebook, LogOut, Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdAccount } from "@/lib/hooks/use-ad-account";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
}

export function Header({ title = "Dashboard", showSearch = true }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { accounts, selectedAccountId, setSelectedAccountId, isLoading } = useAdAccount();

  const hasAccounts = accounts.length > 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Page Title */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="relative hidden w-96 md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search campaigns, ads, or keywords..."
            className="pl-9"
            aria-label="Search"
          />
        </div>
      )}

      {/* Ad Account Switcher */}
      {isLoading ? (
        <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
      ) : hasAccounts ? (
        <Select
          value={selectedAccountId ?? undefined}
          onValueChange={(value) => setSelectedAccountId(value)}
        >
          <SelectTrigger className="w-48" aria-label="Select ad account">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => router.push("/dashboard/settings")}
        >
          <Facebook className="h-4 w-4" />
          Connect Facebook
        </Button>
      )}

      {/* Notifications */}
      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
      </Button>

      {/* User Menu */}
      <div className="relative">
        <Button
          variant="ghost"
          className="gap-2"
          aria-label="User menu"
          data-testid="user-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            JD
          </div>
          <span className="hidden md:inline-block">John Doe</span>
          <ChevronDown className="h-4 w-4" />
        </Button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-background shadow-lg" data-testid="user-dropdown">
            <div className="p-1">
              <button
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent"
                data-testid="profile-button"
                onClick={() => setMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <button
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent"
                data-testid="settings-button"
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/dashboard/settings");
                }}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <div className="my-1 border-t" />
              <a
                href="/api/auth/signout"
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-destructive hover:bg-accent"
                data-testid="logout-button"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
