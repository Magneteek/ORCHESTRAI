"use client"

import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TemplateUsageStats {
  timesUsed: number
  activeCampaigns: number
  isGlobal: boolean
}

interface ConfirmDeleteTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateName: string
  usageStats: TemplateUsageStats
  onConfirm: () => void
  isLoading?: boolean
}

export function ConfirmDeleteTemplateDialog({
  open,
  onOpenChange,
  templateName,
  usageStats,
  onConfirm,
  isLoading = false,
}: ConfirmDeleteTemplateDialogProps) {
  const hasUsage = usageStats.timesUsed > 0 || usageStats.activeCampaigns > 0
  const isGlobal = usageStats.isGlobal

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Template</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{templateName}"?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4">
            <h4 className="mb-3 text-sm font-semibold">Template Usage</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Uses</p>
                <p className="text-2xl font-bold">{usageStats.timesUsed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{usageStats.activeCampaigns}</p>
              </div>
            </div>
            {isGlobal && (
              <Badge variant="default" className="mt-3">
                Global Template
              </Badge>
            )}
          </div>

          {hasUsage && (
            <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-900">
                  Template is Currently in Use
                </p>
                <p className="text-sm text-yellow-700">
                  This template has been used {usageStats.timesUsed} time(s) and has{" "}
                  {usageStats.activeCampaigns} active campaign(s) based on it.
                </p>
              </div>
            </div>
          )}

          {isGlobal && (
            <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-900">
                  Deleting Global Template
                </p>
                <p className="text-sm text-red-700">
                  This is a global template available to all organizations. Deleting it will remove
                  access for everyone.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-2 text-sm font-semibold">What happens when you delete?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="shrink-0">•</span>
                <span>The template will be permanently deleted</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">•</span>
                <span>Existing campaigns using this template will continue running</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">•</span>
                <span>Template launch history will be preserved for analytics</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">•</span>
                <span>Users will no longer be able to create new campaigns from this template</span>
              </li>
            </ul>
          </div>

          <p className="text-sm font-medium text-destructive">
            This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
