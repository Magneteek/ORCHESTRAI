"use client"

import { useState } from "react"
import { Plus, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export interface DynamicField {
  name: string
  type: "text" | "number" | "url"
  required: boolean
  placeholder?: string
  defaultValue?: string
}

interface DynamicFieldBuilderProps {
  fields: DynamicField[]
  onChange: (fields: DynamicField[]) => void
  templateContent?: string
}

export function DynamicFieldBuilder({
  fields,
  onChange,
  templateContent,
}: DynamicFieldBuilderProps) {
  const [showPreview, setShowPreview] = useState(false)

  const addField = () => {
    const newField: DynamicField = {
      name: "",
      type: "text",
      required: false,
      placeholder: "",
      defaultValue: "",
    }
    onChange([...fields, newField])
  }

  const removeField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index)
    onChange(updated)
  }

  const updateField = (index: number, updates: Partial<DynamicField>) => {
    const updated = fields.map((field, i) =>
      i === index ? { ...field, ...updates } : field
    )
    onChange(updated)
  }

  const getDuplicateNames = () => {
    const names = fields.map(f => f.name.toLowerCase()).filter(n => n)
    return names.filter((name, index) => names.indexOf(name) !== index)
  }

  const duplicateNames = getDuplicateNames()

  const getPreviewContent = () => {
    if (!templateContent) return "Add template content to see preview with placeholders..."

    let preview = templateContent
    fields.forEach(field => {
      if (field.name) {
        const placeholder = `{{${field.name}}}`
        const value = field.defaultValue || `[${field.name}]`
        preview = preview.replace(new RegExp(placeholder, 'g'), value)
      }
    })
    return preview
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dynamic Fields</CardTitle>
              <CardDescription>
                Define placeholders that users can customize when using this template
              </CardDescription>
            </div>
            <Button onClick={addField} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No dynamic fields defined. Click "Add Field" to create customizable placeholders.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => {
                const isDuplicate = field.name && duplicateNames.includes(field.name.toLowerCase())

                return (
                  <Card key={index} className={isDuplicate ? "border-destructive" : ""}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`field-name-${index}`}>
                                  Field Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id={`field-name-${index}`}
                                  placeholder="e.g., product_name"
                                  value={field.name}
                                  onChange={(e) =>
                                    updateField(index, { name: e.target.value })
                                  }
                                  className={isDuplicate ? "border-destructive" : ""}
                                />
                                {isDuplicate && (
                                  <p className="text-sm text-destructive">
                                    Duplicate field name
                                  </p>
                                )}
                                {field.name && (
                                  <p className="text-xs text-muted-foreground">
                                    Use in template: <code className="rounded bg-muted px-1 py-0.5">{`{{${field.name}}}`}</code>
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`field-type-${index}`}>Type</Label>
                                <Select
                                  value={field.type}
                                  onValueChange={(value: DynamicField["type"]) =>
                                    updateField(index, { type: value })
                                  }
                                >
                                  <SelectTrigger id={`field-type-${index}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="url">URL</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`field-placeholder-${index}`}>
                                  Placeholder
                                </Label>
                                <Input
                                  id={`field-placeholder-${index}`}
                                  placeholder="e.g., Enter product name"
                                  value={field.placeholder || ""}
                                  onChange={(e) =>
                                    updateField(index, { placeholder: e.target.value })
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`field-default-${index}`}>
                                  Default Value
                                </Label>
                                <Input
                                  id={`field-default-${index}`}
                                  placeholder="Optional default"
                                  value={field.defaultValue || ""}
                                  onChange={(e) =>
                                    updateField(index, { defaultValue: e.target.value })
                                  }
                                  type={field.type === "number" ? "number" : "text"}
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`field-required-${index}`}
                                checked={field.required}
                                onCheckedChange={(checked) =>
                                  updateField(index, { required: checked === true })
                                }
                              />
                              <Label
                                htmlFor={`field-required-${index}`}
                                className="text-sm font-normal"
                              >
                                Required field
                              </Label>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeField(index)}
                            className="shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {fields.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Available Placeholders</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {showPreview ? "Hide" : "Show"} Preview
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fields
                    .filter(f => f.name)
                    .map((field, index) => (
                      <Badge key={index} variant="secondary">
                        {`{{${field.name}}}`}
                        {field.required && (
                          <span className="ml-1 text-destructive">*</span>
                        )}
                      </Badge>
                    ))}
                </div>
                {showPreview && templateContent && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Preview with Values</CardTitle>
                      <CardDescription>
                        Shows how the template looks with default values
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-muted p-4">
                        <pre className="whitespace-pre-wrap text-sm">
                          {getPreviewContent()}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {duplicateNames.length > 0 && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            Please fix duplicate field names before saving
          </p>
        </div>
      )}
    </div>
  )
}
