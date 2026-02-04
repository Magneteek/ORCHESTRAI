"use client"

import { useState } from "react"
import { UserRole } from "@prisma/client"
import { MoreVertical, Shield, User as UserIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfirmRoleChangeDialog } from "./confirm-role-change-dialog"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  updatedAt: Date
  _count?: {
    campaigns?: number
  }
}

interface UserManagementTableProps {
  users: User[]
  currentUserId: string
  onUserUpdate?: () => void
}

export function UserManagementTable({
  users,
  currentUserId,
  onUserUpdate,
}: UserManagementTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<UserRole | null>(null)
  const [isRoleChangeOpen, setIsRoleChangeOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleRoleChange = (user: User, role: UserRole) => {
    if (user.role === role) return

    setSelectedUser(user)
    setNewRole(role)
    setIsRoleChangeOpen(true)
  }

  const confirmRoleChange = async () => {
    if (!selectedUser || !newRole) return

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to update user role")
      }

      toast({
        title: "Role Updated",
        description: `${selectedUser.name || selectedUser.email}'s role has been updated to ${newRole}`,
        variant: "success",
      })

      setIsRoleChangeOpen(false)
      setSelectedUser(null)
      setNewRole(null)
      onUserUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeactivate = async (userId: string) => {
    toast({
      title: "Not Implemented",
      description: "User deactivation will be implemented in a future update",
    })
  }

  const getStatusBadge = (user: User) => {
    return (
      <Badge variant="active">
        Active
      </Badge>
    )
  }

  const getRoleBadge = (role: UserRole) => {
    if (role === UserRole.ADMIN) {
      return (
        <Badge variant="default" className="gap-1">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <UserIcon className="h-3 w-3" />
        User
      </Badge>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Campaigns</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isCurrentUser = user.id === currentUserId
                const adminCount = users.filter(u => u.role === UserRole.ADMIN).length
                const isLastAdmin = user.role === UserRole.ADMIN && adminCount === 1

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{user.name || "No name"}</span>
                        {isCurrentUser && (
                          <span className="text-xs text-muted-foreground">(You)</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {isCurrentUser || isLastAdmin ? (
                        getRoleBadge(user.role)
                      ) : (
                        <Select
                          value={user.role}
                          onValueChange={(value: UserRole) =>
                            handleRoleChange(user, value)
                          }
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue>
                              {getRoleBadge(user.role)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UserRole.ADMIN}>
                              <div className="flex items-center gap-2">
                                <Shield className="h-3 w-3" />
                                Admin
                              </div>
                            </SelectItem>
                            <SelectItem value={UserRole.USER}>
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-3 w-3" />
                                User
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(user.updatedAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {user._count?.campaigns || 0}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isCurrentUser}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeactivate(user.id)}
                          >
                            Deactivate User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && newRole && (
        <ConfirmRoleChangeDialog
          open={isRoleChangeOpen}
          onOpenChange={setIsRoleChangeOpen}
          userName={selectedUser.name || selectedUser.email}
          currentRole={selectedUser.role}
          newRole={newRole}
          onConfirm={confirmRoleChange}
          isLoading={isUpdating}
        />
      )}
    </>
  )
}
