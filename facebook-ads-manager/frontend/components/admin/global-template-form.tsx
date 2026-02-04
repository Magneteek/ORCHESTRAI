"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DynamicFieldBuilder, type DynamicField } from "./dynamic-field-builder"
import { useToast } from "@/components/ui/use-toast"

const templateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  objective: z.string().min(1, "Objective is required"),
  isGlobal: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  headline: z.string().min(1, "Headline is required"),
  primaryText: z.string().min(1, "Primary text is required"),
  ctaText: z.string().min(1, "Call to action is required"),
  budget: z.coerce.number().min(1, "Budget must be at least 1"),
  bidStrategy: z.string().min(1, "Bid strategy is required"),
})

type TemplateFormData = z.infer<typeof templateSchema>

interface GlobalTemplateFormProps {
  initialData?: any
  templateId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function GlobalTemplateForm({
  initialData,
  templateId,
  onSuccess,
  onCancel,
}: GlobalTemplateFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>(
    initialData?.dynamicFields?.fields || []
  )
  const { toast } = useToast()

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "e-commerce",
      objective: initialData?.objective || "OUTCOME_SALES",
      isGlobal: initialData?.isGlobal || false,
      isFeatured: initialData?.isFeatured || false,
      headline: initialData?.adCopy?.headline || "",
      primaryText: initialData?.adCopy?.primaryText || "",
      ctaText: initialData?.adCopy?.callToAction || "",
      budget: initialData?.campaignStructure?.budget || 50,
      bidStrategy: initialData?.campaignStructure?.bidStrategy || "LOWEST_COST",
    },
  })

  const onSubmit = async (data: TemplateFormData) => {
    const hasDuplicateFields = dynamicFields.some((field, index) =>
      dynamicFields.findIndex(f => f.name.toLowerCase() === field.name.toLowerCase()) !== index
    )

    if (hasDuplicateFields) {
      toast({
        title: "Validation Error",
        description: "Please fix duplicate dynamic field names",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        name: data.name,
        description: data.description,
        category: data.category,
        objective: data.objective,
        isGlobal: data.isGlobal,
        isFeatured: data.isFeatured,
        visibility: "public",
        adCopy: {
          headline: data.headline,
          primaryText: data.primaryText,
          description: "",
          callToAction: data.ctaText,
        },
        creativeSpecs: {
          format: "image",
        },
        targetingConfig: {
          interests: [],
          demographics: {},
          behaviors: [],
          locations: [],
        },
        campaignStructure: {
          budget: data.budget,
          bidStrategy: data.bidStrategy,
          placements: ["facebook_feed", "instagram_feed"],
        },
        dynamicFields: {
          fields: dynamicFields,
        },
      }

      const url = templateId
        ? `/api/admin/templates/${templateId}`
        : `/api/admin/templates`

      const response = await fetch(url, {
        method: templateId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to save template")
      }

      toast({
        title: templateId ? "Template Updated" : "Template Created",
        description: `${data.name} has been ${templateId ? "updated" : "created"} successfully`,
        variant: "success",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save template",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              General information about the template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E-commerce Product Launch" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this template is best used for..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="e-commerce">E-commerce</SelectItem>
                        <SelectItem value="lead-generation">Lead Generation</SelectItem>
                        <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                        <SelectItem value="app-promotion">App Promotion</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="traffic">Traffic</SelectItem>
                        <SelectItem value="video-views">Video Views</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Objective</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select objective" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OUTCOME_SALES">Sales</SelectItem>
                        <SelectItem value="OUTCOME_LEADS">Leads</SelectItem>
                        <SelectItem value="OUTCOME_TRAFFIC">Traffic</SelectItem>
                        <SelectItem value="OUTCOME_AWARENESS">Awareness</SelectItem>
                        <SelectItem value="OUTCOME_ENGAGEMENT">Engagement</SelectItem>
                        <SelectItem value="OUTCOME_APP_PROMOTION">App Promotion</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isGlobal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Global Template
                      </FormLabel>
                      <FormDescription>
                        Make this template available to all organizations
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Featured Template
                      </FormLabel>
                      <FormDescription>
                        Highlight this template as recommended
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ad Copy</CardTitle>
            <CardDescription>
              Define the ad creative content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline</FormLabel>
                  <FormControl>
                    <Input placeholder="Get 50% Off Today!" {...field} />
                  </FormControl>
                  <FormDescription>
                    Main headline for the ad (supports dynamic fields like {`{{product_name}}`})
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primaryText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Discover amazing products..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Main text content (supports dynamic fields)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ctaText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Call to Action</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select CTA" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SHOP_NOW">Shop Now</SelectItem>
                      <SelectItem value="LEARN_MORE">Learn More</SelectItem>
                      <SelectItem value="SIGN_UP">Sign Up</SelectItem>
                      <SelectItem value="GET_QUOTE">Get Quote</SelectItem>
                      <SelectItem value="CONTACT_US">Contact Us</SelectItem>
                      <SelectItem value="DOWNLOAD">Download</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Settings</CardTitle>
            <CardDescription>
              Budget and optimization settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Budget ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="50"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Recommended daily budget
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bidStrategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bid Strategy</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOWEST_COST">Lowest Cost</SelectItem>
                        <SelectItem value="COST_CAP">Cost Cap</SelectItem>
                        <SelectItem value="BID_CAP">Bid Cap</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <DynamicFieldBuilder
          fields={dynamicFields}
          onChange={setDynamicFields}
          templateContent={`${form.watch("headline")} - ${form.watch("primaryText")}`}
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {templateId ? "Update Template" : "Create Template"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
