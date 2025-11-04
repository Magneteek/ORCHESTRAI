"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
}

export function Header({ title = "Dashboard", showSearch = true }: HeaderProps) {
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
      <Select defaultValue="account-1">
        <SelectTrigger className="w-48" aria-label="Select ad account">
          <SelectValue placeholder="Select account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="account-1">Main Account</SelectItem>
          <SelectItem value="account-2">Client Account A</SelectItem>
          <SelectItem value="account-3">Client Account B</SelectItem>
          <SelectItem value="account-4">Test Account</SelectItem>
        </SelectContent>
      </Select>

      {/* Notifications */}
      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
      </Button>

      {/* User Menu */}
      <Button variant="ghost" className="gap-2" aria-label="User menu">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          JD
        </div>
        <span className="hidden md:inline-block">John Doe</span>
        <ChevronDown className="h-4 w-4" />
      </Button>
    </header>
  );
}
