"use client"

import { UserRole } from "@prisma/client"
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

interface ConfirmRoleChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  currentRole: UserRole
  newRole: UserRole
  onConfirm: () => void
  isLoading?: boolean
}

export function ConfirmRoleChangeDialog({
  open,
  onOpenChange,
  userName,
  currentRole,
  newRole,
  onConfirm,
  isLoading = false,
}: ConfirmRoleChangeDialogProps) {
  const isDemotingAdmin = currentRole === UserRole.ADMIN && newRole === UserRole.USER
  const isPromotingToAdmin = currentRole === UserRole.USER && newRole === UserRole.ADMIN

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Role Change</DialogTitle>
          <DialogDescription>
            You are about to change the role for {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Current Role</p>
              <Badge variant={currentRole === UserRole.ADMIN ? "default" : "secondary"} className="mt-1">
                {currentRole}
              </Badge>
            </div>
            <div className="text-muted-foreground">→</div>
            <div>
              <p className="text-sm font-medium">New Role</p>
              <Badge variant={newRole === UserRole.ADMIN ? "default" : "secondary"} className="mt-1">
                {newRole}
              </Badge>
            </div>
          </div>

          {isDemotingAdmin && (
            <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-900">
                  Warning: Demoting Administrator
                </p>
                <p className="text-sm text-yellow-700">
                  This user will lose access to admin-only features including template management,
                  user management, and organization settings.
                </p>
              </div>
            </div>
          )}

          {isPromotingToAdmin && (
            <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-blue-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  Promoting to Administrator
                </p>
                <p className="text-sm text-blue-700">
                  This user will gain full access to template management, user management,
                  organization settings, and all campaigns.
                </p>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            The user will be notified of this role change via email.
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
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Updating..." : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
