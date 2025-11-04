'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import type { AdTemplate } from '@prisma/client';

const templateFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  category: z.string().min(1, 'Category is required'),
  objective: z.string().min(1, 'Objective is required'),
  visibility: z.enum(['private', 'public']),

  // Ad Copy
  headline: z.string().min(1, 'Headline is required').max(255),
  primaryText: z.string().min(1, 'Primary text is required').max(2000),
  adDescription: z.string().max(500).optional(),
  callToAction: z.string().min(1, 'CTA is required'),

  // Creative
  creativeFormat: z.enum(['image', 'video', 'carousel', 'collection']),
  creativeWidth: z.coerce.number().positive().optional(),
  creativeHeight: z.coerce.number().positive().optional(),

  // Targeting
  ageMin: z.coerce.number().min(13).max(65).optional(),
  ageMax: z.coerce.number().min(13).max(65).optional(),
  interests: z.string().optional(),

  // Campaign
  budget: z.coerce.number().positive(),
  bidStrategy: z.string().min(1),
  placements: z.string(),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

interface TemplateFormProps {
  template?: AdTemplate;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TemplateForm({ template, onSubmit, onCancel, isSubmitting }: TemplateFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [placementInput, setPlacementInput] = useState('');
  const [placements, setPlacements] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: template
      ? {
          name: template.name,
          description: template.description || '',
          category: template.category,
          objective: template.objective,
          visibility: template.visibility as 'private' | 'public',
          headline: (template.adCopy as any)?.headline || '',
          primaryText: (template.adCopy as any)?.primaryText || '',
          adDescription: (template.adCopy as any)?.description || '',
          callToAction: (template.adCopy as any)?.callToAction || '',
          creativeFormat: (template.creativeSpecs as any)?.format || 'image',
          creativeWidth: (template.creativeSpecs as any)?.dimensions?.width,
          creativeHeight: (template.creativeSpecs as any)?.dimensions?.height,
          ageMin: (template.targetingConfig as any)?.demographics?.ageMin,
          ageMax: (template.targetingConfig as any)?.demographics?.ageMax,
          budget: (template.campaignStructure as any)?.budget || 50,
          bidStrategy: (template.campaignStructure as any)?.bidStrategy || 'LOWEST_COST_WITHOUT_CAP',
          placements: '',
        }
      : {
          visibility: 'private',
          creativeFormat: 'image',
          budget: 50,
          bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
          placements: '',
        },
  });

  const steps = [
    { id: 0, title: 'Basic Info', description: 'Template name and category' },
    { id: 1, title: 'Ad Copy', description: 'Headlines and text' },
    { id: 2, title: 'Creative', description: 'Image/video specs' },
    { id: 3, title: 'Targeting', description: 'Audience targeting' },
    { id: 4, title: 'Campaign', description: 'Budget and settings' },
    { id: 5, title: 'Review', description: 'Visibility and review' },
  ];

  const addInterest = () => {
    if (interestInput.trim()) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const addPlacement = () => {
    if (placementInput.trim()) {
      setPlacements([...placements, placementInput.trim()]);
      setPlacementInput('');
    }
  };

  const removePlacement = (index: number) => {
    setPlacements(placements.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: TemplateFormData) => {
    const payload = {
      name: data.name,
      description: data.description,
      category: data.category,
      objective: data.objective,
      visibility: data.visibility,
      adCopy: {
        headline: data.headline,
        primaryText: data.primaryText,
        description: data.adDescription,
        callToAction: data.callToAction,
      },
      creativeSpecs: {
        format: data.creativeFormat,
        ...(data.creativeWidth &&
          data.creativeHeight && {
            dimensions: {
              width: data.creativeWidth,
              height: data.creativeHeight,
            },
          }),
      },
      targetingConfig: {
        demographics: {
          ...(data.ageMin && { ageMin: data.ageMin }),
          ...(data.ageMax && { ageMax: data.ageMax }),
        },
        interests,
      },
      campaignStructure: {
        budget: data.budget,
        bidStrategy: data.bidStrategy,
        placements,
      },
    };

    await onSubmit(payload);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div
              className={`flex flex-col items-center cursor-pointer ${
                index === currentStep ? 'opacity-100' : 'opacity-50'
              }`}
              onClick={() => setCurrentStep(index)}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm ${
                  index <= currentStep
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted bg-background'
                }`}
              >
                {index + 1}
              </div>
              <p className="mt-1 text-xs text-center">{step.title}</p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 ${
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 0: Basic Info */}
          {currentStep === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="e.g., Summer Sale Campaign"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe what this template is for..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={watch('category')}
                    onValueChange={(value) => setValue('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="e-commerce">E-commerce</SelectItem>
                      <SelectItem value="lead-generation">Lead Generation</SelectItem>
                      <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                      <SelectItem value="app-promotion">App Promotion</SelectItem>
                      <SelectItem value="event-promotion">Event Promotion</SelectItem>
                      <SelectItem value="local-business">Local Business</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objective">Objective *</Label>
                  <Select
                    value={watch('objective')}
                    onValueChange={(value) => setValue('objective', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OUTCOME_AWARENESS">Awareness</SelectItem>
                      <SelectItem value="OUTCOME_TRAFFIC">Traffic</SelectItem>
                      <SelectItem value="OUTCOME_ENGAGEMENT">Engagement</SelectItem>
                      <SelectItem value="OUTCOME_LEADS">Leads</SelectItem>
                      <SelectItem value="OUTCOME_SALES">Sales</SelectItem>
                      <SelectItem value="APP_INSTALLS">App Installs</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.objective && (
                    <p className="text-sm text-destructive">{errors.objective.message}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 1: Ad Copy */}
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="headline">Headline *</Label>
                <Input
                  id="headline"
                  {...register('headline')}
                  placeholder="Attention-grabbing headline"
                  maxLength={255}
                />
                {errors.headline && (
                  <p className="text-sm text-destructive">{errors.headline.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryText">Primary Text *</Label>
                <Textarea
                  id="primaryText"
                  {...register('primaryText')}
                  placeholder="Main ad copy that appears above the image"
                  rows={4}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">
                  {watch('primaryText')?.length || 0}/2000 characters
                </p>
                {errors.primaryText && (
                  <p className="text-sm text-destructive">{errors.primaryText.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adDescription">Description (Optional)</Label>
                <Textarea
                  id="adDescription"
                  {...register('adDescription')}
                  placeholder="Additional description"
                  rows={2}
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="callToAction">Call to Action *</Label>
                <Select
                  value={watch('callToAction')}
                  onValueChange={(value) => setValue('callToAction', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select CTA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHOP_NOW">Shop Now</SelectItem>
                    <SelectItem value="LEARN_MORE">Learn More</SelectItem>
                    <SelectItem value="SIGN_UP">Sign Up</SelectItem>
                    <SelectItem value="DOWNLOAD">Download</SelectItem>
                    <SelectItem value="GET_QUOTE">Get Quote</SelectItem>
                    <SelectItem value="CONTACT_US">Contact Us</SelectItem>
                    <SelectItem value="APPLY_NOW">Apply Now</SelectItem>
                  </SelectContent>
                </Select>
                {errors.callToAction && (
                  <p className="text-sm text-destructive">{errors.callToAction.message}</p>
                )}
              </div>
            </>
          )}

          {/* Step 2: Creative */}
          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="creativeFormat">Format *</Label>
                <Select
                  value={watch('creativeFormat')}
                  onValueChange={(value: any) => setValue('creativeFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Single Image</SelectItem>
                    <SelectItem value="video">Single Video</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                    <SelectItem value="collection">Collection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creativeWidth">Width (px)</Label>
                  <Input
                    id="creativeWidth"
                    type="number"
                    {...register('creativeWidth')}
                    placeholder="1200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creativeHeight">Height (px)</Label>
                  <Input
                    id="creativeHeight"
                    type="number"
                    {...register('creativeHeight')}
                    placeholder="628"
                  />
                </div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium mb-2">Recommended Sizes:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Feed: 1200 x 628 px</li>
                  <li>• Story: 1080 x 1920 px</li>
                  <li>• Square: 1080 x 1080 px</li>
                  <li>• Carousel: 1080 x 1080 px per card</li>
                </ul>
              </div>
            </>
          )}

          {/* Step 3: Targeting */}
          {currentStep === 3 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageMin">Min Age</Label>
                  <Input
                    id="ageMin"
                    type="number"
                    {...register('ageMin')}
                    placeholder="18"
                    min="13"
                    max="65"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ageMax">Max Age</Label>
                  <Input
                    id="ageMax"
                    type="number"
                    {...register('ageMax')}
                    placeholder="65"
                    min="13"
                    max="65"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add interest..."
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addInterest();
                      }
                    }}
                  />
                  <Button type="button" onClick={addInterest}>
                    Add
                  </Button>
                </div>
                {interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(index)}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 4: Campaign */}
          {currentStep === 4 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="budget">Daily Budget (USD) *</Label>
                <Input
                  id="budget"
                  type="number"
                  {...register('budget')}
                  placeholder="50"
                  min="1"
                  step="1"
                />
                {errors.budget && (
                  <p className="text-sm text-destructive">{errors.budget.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bidStrategy">Bid Strategy *</Label>
                <Select
                  value={watch('bidStrategy')}
                  onValueChange={(value) => setValue('bidStrategy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOWEST_COST_WITHOUT_CAP">Lowest Cost</SelectItem>
                    <SelectItem value="LOWEST_COST_WITH_BID_CAP">Bid Cap</SelectItem>
                    <SelectItem value="COST_CAP">Cost Cap</SelectItem>
                    <SelectItem value="LOWEST_COST_WITH_MIN_ROAS">Target ROAS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Placements</Label>
                <div className="flex gap-2">
                  <Select value={placementInput} onValueChange={setPlacementInput}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select placement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook_feed">Facebook Feed</SelectItem>
                      <SelectItem value="facebook_story">Facebook Story</SelectItem>
                      <SelectItem value="instagram_feed">Instagram Feed</SelectItem>
                      <SelectItem value="instagram_story">Instagram Story</SelectItem>
                      <SelectItem value="audience_network">Audience Network</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addPlacement}>
                    Add
                  </Button>
                </div>
                {placements.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {placements.map((placement, index) => (
                      <Badge key={index} variant="secondary">
                        {placement.replace(/_/g, ' ')}
                        <button
                          type="button"
                          onClick={() => removePlacement(index)}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility *</Label>
                <Select
                  value={watch('visibility')}
                  onValueChange={(value: 'private' | 'public') =>
                    setValue('visibility', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (Only you)</SelectItem>
                    <SelectItem value="public">Public (Everyone)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <h4 className="font-medium">Template Summary</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Name:</span>{' '}
                    <span className="font-medium">{watch('name')}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Category:</span>{' '}
                    <Badge variant="outline">{watch('category')}</Badge>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Headline:</span>{' '}
                    {watch('headline')}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Budget:</span> $
                    {watch('budget')}/day
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div>
          {currentStep > 0 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {template ? 'Update Template' : 'Create Template'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
