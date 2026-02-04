"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"
import { Plus, Filter, Globe, Building2, Star, Trash2, Edit, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UnauthorizedPage } from "@/components/admin/unauthorized-page"
import { GlobalTemplateForm } from "@/components/admin/global-template-form"
import { ConfirmDeleteTemplateDialog } from "@/components/admin/confirm-delete-template-dialog"
import { useToast } from "@/components/ui/use-toast"

interface Template {
  id: string
  name: string
  description: string | null
  category: string
  objective: string
  isGlobal: boolean
  timesUsed: number
  createdAt: string
  updatedAt: string
  performanceAggregate?: {
    avgRoas: number | null
    totalSpend: number
    accountsUsing: number
  }
  _count?: {
    campaigns: number
  }
}

export default function AdminTemplatesPage() {
  const { data: session, status } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [viewFilter, setViewFilter] = useState<"all" | "global" | "organization">("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === UserRole.ADMIN) {
      fetchTemplates()
    }
  }, [status, session])

  useEffect(() => {
    filterTemplates()
  }, [templates, searchQuery, categoryFilter, viewFilter])

  const fetchTemplates = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/templates")
      const result = await response.json()

      if (response.ok) {
        setTemplates(result.data || [])
      } else {
        throw new Error(result.error?.message || "Failed to fetch templates")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load templates",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterTemplates = () => {
    let filtered = templates

    if (viewFilter === "global") {
      filtered = filtered.filter(t => t.isGlobal)
    } else if (viewFilter === "organization") {
      filtered = filtered.filter(t => !t.isGlobal)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(t => t.category === categoryFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      )
    }

    setFilteredTemplates(filtered)
  }

  const handleDelete = async () => {
    if (!deletingTemplate) return

    try {
      const response = await fetch(`/api/admin/templates/${deletingTemplate.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to delete template")
      }

      toast({
        title: "Template Deleted",
        description: `${deletingTemplate.name} has been deleted successfully`,
        variant: "success",
      })

      setDeletingTemplate(null)
      fetchTemplates()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading...</p>
      </div>
    )
  }

  if (session?.user.role !== UserRole.ADMIN) {
    return <UnauthorizedPage />
  }

  const stats = {
    total: templates.length,
    global: templates.filter(t => t.isGlobal).length,
    organization: templates.filter(t => !t.isGlobal).length,
    totalUsage: templates.reduce((sum, t) => sum + t.timesUsed, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Template Management</h2>
          <p className="text-muted-foreground">
            Manage global and organization-specific templates
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Global Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Templates</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.global}</div>
            <p className="text-xs text-muted-foreground">
              Available to everyone
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization Templates</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.organization}</div>
            <p className="text-xs text-muted-foreground">
              Organization-specific
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsage}</div>
            <p className="text-xs text-muted-foreground">
              Times templates used
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="e-commerce">E-commerce</SelectItem>
            <SelectItem value="lead-generation">Lead Generation</SelectItem>
            <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
            <SelectItem value="app-promotion">App Promotion</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="traffic">Traffic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={viewFilter} onValueChange={(v: any) => setViewFilter(v)}>
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="global">Global Only</TabsTrigger>
          <TabsTrigger value="organization">Organization Only</TabsTrigger>
        </TabsList>

        <TabsContent value={viewFilter} className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <p className="text-muted-foreground">No templates found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description || "No description"}
                        </CardDescription>
                      </div>
                      {template.isGlobal && (
                        <Badge variant="default" className="ml-2">
                          <Globe className="mr-1 h-3 w-3" />
                          Global
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{template.category}</Badge>
                      <Badge variant="outline">{template.objective}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Times Used</p>
                        <p className="font-semibold">{template.timesUsed}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Active Campaigns</p>
                        <p className="font-semibold">{template._count?.campaigns || 0}</p>
                      </div>
                      {template.performanceAggregate?.avgRoas && (
                        <>
                          <div>
                            <p className="text-muted-foreground">Avg ROAS</p>
                            <p className="font-semibold">
                              {template.performanceAggregate.avgRoas.toFixed(2)}x
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Accounts Using</p>
                            <p className="font-semibold">
                              {template.performanceAggregate.accountsUsing}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingTemplate(template)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingTemplate(template)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Global Template</DialogTitle>
            <DialogDescription>
              Create a new template that will be available to all organizations
            </DialogDescription>
          </DialogHeader>
          <GlobalTemplateForm
            onSuccess={() => {
              setIsCreateDialogOpen(false)
              fetchTemplates()
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update template settings and content
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <GlobalTemplateForm
              initialData={editingTemplate}
              templateId={editingTemplate.id}
              onSuccess={() => {
                setEditingTemplate(null)
                fetchTemplates()
              }}
              onCancel={() => setEditingTemplate(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {deletingTemplate && (
        <ConfirmDeleteTemplateDialog
          open={!!deletingTemplate}
          onOpenChange={(open) => !open && setDeletingTemplate(null)}
          templateName={deletingTemplate.name}
          usageStats={{
            timesUsed: deletingTemplate.timesUsed,
            activeCampaigns: deletingTemplate._count?.campaigns || 0,
            isGlobal: deletingTemplate.isGlobal,
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
