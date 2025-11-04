/**
 * Skip Navigation Link Component
 * WCAG 2.4.1 - Bypass Blocks (Level A)
 *
 * Allows keyboard users to skip repetitive navigation
 * and jump directly to main content.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Hidden by default
        "sr-only",
        // Visible when focused
        "focus:not-sr-only",
        "focus:fixed",
        "focus:top-4",
        "focus:left-4",
        "focus:z-50",
        "focus:inline-block",
        "focus:px-6",
        "focus:py-3",
        "focus:bg-primary",
        "focus:text-primary-foreground",
        "focus:rounded-lg",
        "focus:shadow-lg",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-ring",
        "focus:ring-offset-2",
        // Smooth transitions
        "transition-all",
        "duration-200",
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * Multiple Skip Links Component
 * For complex pages with multiple navigation areas
 */
export interface SkipLinksProps {
  links?: Array<{
    href: string;
    label: string;
  }>;
  className?: string;
}

export function SkipLinks({
  links = [
    { href: "#main-content", label: "Skip to main content" },
    { href: "#main-navigation", label: "Skip to navigation" },
    { href: "#footer", label: "Skip to footer" },
  ],
  className,
}: SkipLinksProps) {
  return (
    <div
      className={cn("skip-links-container", className)}
      role="region"
      aria-label="Skip navigation links"
    >
      {links.map((link) => (
        <SkipLink key={link.href} href={link.href}>
          {link.label}
        </SkipLink>
      ))}
    </div>
  );
}
