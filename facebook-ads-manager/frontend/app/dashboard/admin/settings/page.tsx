"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Settings, Save, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { UnauthorizedPage } from "@/components/admin/unauthorized-page"
import { useToast } from "@/components/ui/use-toast"

const settingsSchema = z.object({
  performanceRetentionDays: z.coerce.number().min(30, "Minimum 30 days").max(730, "Maximum 730 days"),
  aiRecommendations: z.boolean(),
  abTesting: z.boolean(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface OrgSettings {
  performanceRetentionDays: number
  features: {
    aiRecommendations: boolean
    abTesting: boolean
  }
  defaultFieldValues: Record<string, string>
  customCategories: string[]
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [defaultFields, setDefaultFields] = useState<Record<string, string>>({})
  const [newFieldKey, setNewFieldKey] = useState("")
  const [newFieldValue, setNewFieldValue] = useState("")
  const { toast } = useToast()

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      performanceRetentionDays: 365,
      aiRecommendations: true,
      abTesting: false,
    },
  })

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === UserRole.ADMIN) {
      fetchSettings()
    }
  }, [status, session])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/settings")
      const result = await response.json()

      if (response.ok && result.data) {
        const settings: OrgSettings = result.data
        form.reset({
          performanceRetentionDays: settings.performanceRetentionDays,
          aiRecommendations: settings.features.aiRecommendations,
          abTesting: settings.features.abTesting,
        })
        setCustomCategories(settings.customCategories || [])
        setDefaultFields(settings.defaultFieldValues || {})
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true)

    try {
      const payload = {
        performanceRetentionDays: data.performanceRetentionDays,
        features: {
          aiRecommendations: data.aiRecommendations,
          abTesting: data.abTesting,
        },
        customCategories,
        defaultFieldValues: defaultFields,
      }

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to save settings")
      }

      toast({
        title: "Settings Saved",
        description: "Organization settings have been updated successfully",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addCategory = () => {
    if (newCategory && !customCategories.includes(newCategory)) {
      setCustomCategories([...customCategories, newCategory])
      setNewCategory("")
    }
  }

  const removeCategory = (category: string) => {
    setCustomCategories(customCategories.filter(c => c !== category))
  }

  const addDefaultField = () => {
    if (newFieldKey && !defaultFields[newFieldKey]) {
      setDefaultFields({ ...defaultFields, [newFieldKey]: newFieldValue })
      setNewFieldKey("")
      setNewFieldValue("")
    }
  }

  const removeDefaultField = (key: string) => {
    const updated = { ...defaultFields }
    delete updated[key]
    setDefaultFields(updated)
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading...</p>
      </div>
    )
  }

  if (session?.user.role !== UserRole.ADMIN) {
    return <UnauthorizedPage />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organization Settings</h2>
          <p className="text-muted-foreground">
            Configure organization-wide settings and defaults
          </p>
        </div>
        <Settings className="h-8 w-8 text-muted-foreground" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Data</CardTitle>
              <CardDescription>
                Configure how long performance data is retained
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="performanceRetentionDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Retention Period (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="30"
                        max="730"
                        placeholder="365"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of days to keep performance metrics (30-730 days)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Enable or disable beta features for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="aiRecommendations"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>AI Recommendations</FormLabel>
                      <FormDescription>
                        Enable AI-powered campaign optimization suggestions
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="abTesting"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>A/B Testing (Beta)</FormLabel>
                      <FormDescription>
                        Enable A/B testing features for campaign optimization
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Template Categories</CardTitle>
              <CardDescription>
                Add custom categories for organizing templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
                />
                <Button type="button" onClick={addCategory}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {customCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="gap-1">
                      {category}
                      <button
                        type="button"
                        onClick={() => removeCategory(category)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default Dynamic Field Values</CardTitle>
              <CardDescription>
                Pre-populate field values for templates across your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Field name"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Default value"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDefaultField())}
                />
                <Button type="button" onClick={addDefaultField}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {Object.keys(defaultFields).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(defaultFields).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{key}</p>
                        <p className="text-sm text-muted-foreground">{value}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDefaultField(key)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
