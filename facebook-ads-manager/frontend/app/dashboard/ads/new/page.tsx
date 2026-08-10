'use client';

import { Suspense, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAdAccount } from '@/lib/hooks/use-ad-account';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Check, Loader2, FileText, Image as ImageIcon, Eye,
  Plus, Trash2, LayoutGrid, Video, ImagePlus, Link2,
  Globe, MessageCircle, ClipboardList, Upload, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

// ─── Schema ───────────────────────────────────────────────────────────────────

const adSchema = z.object({
  adSetId: z.string().min(1, 'Ad set is required'),
  pageId: z.string().min(1, 'Facebook Page is required'),
  name: z.string().min(1, 'Ad name is required'),
  status: z.enum(['ACTIVE', 'PAUSED']),
  format: z.enum(['SINGLE_IMAGE', 'CAROUSEL', 'VIDEO']),
  destinationType: z.enum(['WEBSITE', 'INSTANT_FORM', 'WHATSAPP']),
  // Destination-specific
  linkUrl: z.string().optional(),
  leadFormId: z.string().optional(),
  whatsappNumber: z.string().optional(),
  // CTA (for WEBSITE only)
  callToActionType: z.string().optional(),
  // Text variants
  headlines: z.array(z.object({ value: z.string() })).min(1),
  primaryTexts: z.array(z.object({ value: z.string() })).min(1),
  descriptions: z.array(z.object({ value: z.string() })),
  // Single image / video
  imageUrl: z.string().optional(),
  imageHash: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  imageHashes: z.array(z.string()).optional(),
  videoId: z.string().optional(),
  // Carousel
  carouselCards: z.array(z.object({
    imageUrl: z.string().optional(),
    imageHash: z.string().optional(),
    headline: z.string().optional(),
    description: z.string().optional(),
    linkUrl: z.string().optional(),
  })),
  // UTM
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
});

type AdFormData = z.infer<typeof adSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, name: 'Setup', icon: FileText },
  { id: 2, name: 'Creative', icon: ImageIcon },
  { id: 3, name: 'Review', icon: Eye },
];

const CTA_TYPES = [
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'SHOP_NOW', label: 'Shop Now' },
  { value: 'SIGN_UP', label: 'Sign Up' },
  { value: 'CONTACT_US', label: 'Contact Us' },
  { value: 'BOOK_NOW', label: 'Book Now' },
  { value: 'DOWNLOAD', label: 'Download' },
  { value: 'GET_OFFER', label: 'Get Offer' },
  { value: 'APPLY_NOW', label: 'Apply Now' },
  { value: 'GET_QUOTE', label: 'Get Quote' },
  { value: 'SUBSCRIBE', label: 'Subscribe' },
  { value: 'NO_BUTTON', label: 'No Button' },
];

const LEAD_FORM_CTAS = [
  { value: 'SIGN_UP', label: 'Sign Up' },
  { value: 'GET_QUOTE', label: 'Get Quote' },
  { value: 'APPLY_NOW', label: 'Apply Now' },
  { value: 'CONTACT_US', label: 'Contact Us' },
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'DOWNLOAD', label: 'Download' },
  { value: 'SUBSCRIBE', label: 'Subscribe' },
];

const AD_FORMATS = [
  { value: 'SINGLE_IMAGE' as const, label: 'Single Image', description: 'One image + copy', icon: ImagePlus },
  { value: 'CAROUSEL' as const, label: 'Carousel', description: '2–10 swipeable cards', icon: LayoutGrid },
  { value: 'VIDEO' as const, label: 'Video', description: 'Facebook-hosted video', icon: Video },
];

const DESTINATION_TYPES = [
  {
    value: 'WEBSITE' as const,
    label: 'Website',
    description: 'Send people to a URL',
    icon: Globe,
  },
  {
    value: 'INSTANT_FORM' as const,
    label: 'Instant Form',
    description: 'Collect leads without leaving Facebook',
    icon: ClipboardList,
  },
  {
    value: 'WHATSAPP' as const,
    label: 'WhatsApp',
    description: 'Start a WhatsApp conversation',
    icon: MessageCircle,
  },
];

const LEAD_QUESTION_OPTIONS = [
  { value: 'FULL_NAME', label: 'Full Name' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone Number' },
  { value: 'COMPANY_NAME', label: 'Company Name' },
  { value: 'JOB_TITLE', label: 'Job Title' },
  { value: 'CITY', label: 'City' },
  { value: 'COUNTRY', label: 'Country' },
  { value: 'ZIP_CODE', label: 'Zip / Postal Code' },
  { value: 'DATE_OF_BIRTH', label: 'Date of Birth' },
];

// ─── Component ────────────────────────────────────────────────────────────────

function NewAdPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedAccountId } = useAdAccount();
  const preselectedAdSetId = searchParams.get('adSetId') || '';

  const [currentStep, setCurrentStep] = useState(1);
  const [utmEnabled, setUtmEnabled] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  // Additional image slots (indexes 1-9, complementing the primary image at index 0)
  const [extraImages, setExtraImages] = useState<Array<{url: string; hash: string; preview: string}>>([]);
  const [extraUploading, setExtraUploading] = useState<Record<number, boolean>>({});
  const extraFileInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  // Lead form creation dialog
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPrivacyUrl, setFormPrivacyUrl] = useState('');
  const [formThankYouTitle, setFormThankYouTitle] = useState('Thank you!');
  const [formThankYouBody, setFormThankYouBody] = useState("We'll be in touch.");
  const [formThankYouUrl, setFormThankYouUrl] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(['FULL_NAME', 'EMAIL', 'PHONE']);
  const [customQuestion, setCustomQuestion] = useState('');
  const [creatingForm, setCreatingForm] = useState(false);
  const [createFormError, setCreateFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, setError, clearErrors, trigger, control, formState: { errors } } =
    useForm<AdFormData>({
      resolver: zodResolver(adSchema),
      defaultValues: {
        adSetId: preselectedAdSetId,
        status: 'PAUSED',
        format: 'SINGLE_IMAGE',
        destinationType: 'WEBSITE',
        callToActionType: 'LEARN_MORE',
        headlines: [{ value: '' }],
        primaryTexts: [{ value: '' }],
        descriptions: [],
        carouselCards: [
          { imageUrl: '', imageHash: '', headline: '', description: '', linkUrl: '' },
          { imageUrl: '', imageHash: '', headline: '', description: '', linkUrl: '' },
        ],
        utmSource: 'facebook',
        utmMedium: 'paid_social',
        utmCampaign: '{{campaign.name}}',
        utmContent: '{{adset.name}}',
        utmTerm: '{{ad.name}}',
      },
    });

  const { fields: headlineFields, append: addHeadline, remove: removeHeadline } =
    useFieldArray({ control, name: 'headlines' });
  const { fields: primaryTextFields, append: addPrimaryText, remove: removePrimaryText } =
    useFieldArray({ control, name: 'primaryTexts' });
  const { fields: descFields, append: addDesc, remove: removeDesc } =
    useFieldArray({ control, name: 'descriptions' });
  const { fields: cardFields, append: addCard, remove: removeCard } =
    useFieldArray({ control, name: 'carouselCards' });

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: adSetsData } = useQuery({
    queryKey: ['ad-sets-for-ad', selectedAccountId],
    queryFn: async () => {
      if (!selectedAccountId) return [];
      const res = await fetch(`/api/ad-sets?adAccountId=${selectedAccountId}&limit=100`);
      return (await res.json()).data || [];
    },
    enabled: !!selectedAccountId,
  });

  const { data: pagesData, isLoading: pagesLoading } = useQuery({
    queryKey: ['facebook-pages', selectedAccountId],
    queryFn: async () => {
      if (!selectedAccountId) return [];
      const res = await fetch(`/api/facebook/pages?adAccountId=${selectedAccountId}`);
      return (await res.json()).data || [];
    },
    enabled: !!selectedAccountId,
  });

  const formData = watch();

  const { data: leadFormsData, isLoading: leadFormsLoading, refetch: refetchLeadForms } = useQuery({
    queryKey: ['lead-forms', selectedAccountId, formData.pageId],
    queryFn: async () => {
      if (!selectedAccountId || !formData.pageId) return [];
      const res = await fetch(`/api/facebook/lead-forms?adAccountId=${selectedAccountId}&pageId=${formData.pageId}`);
      return (await res.json()).data || [];
    },
    enabled: !!selectedAccountId && !!formData.pageId && formData.destinationType === 'INSTANT_FORM',
  });

  // ── Image upload ───────────────────────────────────────────────────────────

  const handleFileSelect = useCallback(async (file: File) => {
    setUploadError('');
    if (!selectedAccountId) {
      setUploadError('No ad account selected. Please select an account from the top navigation before uploading.');
      return;
    }
    // Show local preview immediately
    const blobUrl = URL.createObjectURL(file);
    setImagePreview(blobUrl);
    setUploadingImage(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target?.result as string;
        const res = await fetch('/api/ads/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adAccountId: selectedAccountId, imageData: base64, fileName: file.name }),
        });
        const json = await res.json();
        if (json.data?.imageHash) {
          setValue('imageHash', json.data.imageHash);
          clearErrors('imageHash');
          if (json.data.url) setImagePreview(json.data.url);
        } else {
          const errMsg = json.error?.message || 'Upload failed — no image hash returned';
          setUploadError(errMsg);
          setImagePreview('');
        }
      } catch (err: any) {
        setUploadError(err?.message || 'Upload failed. Please try again.');
        setImagePreview('');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.onerror = () => {
      setUploadError('Could not read the selected file.');
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  }, [selectedAccountId, setValue, clearErrors]);

  const clearImage = () => {
    setValue('imageUrl', '');
    setValue('imageHash', '');
    setImagePreview('');
  };

  const handleExtraFileSelect = useCallback(async (file: File, idx: number) => {
    if (!selectedAccountId) return;
    const blobUrl = URL.createObjectURL(file);
    setExtraImages(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], preview: blobUrl };
      return next;
    });
    setExtraUploading(prev => ({ ...prev, [idx]: true }));
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target?.result as string;
        const res = await fetch('/api/ads/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adAccountId: selectedAccountId, imageData: base64, fileName: file.name }),
        });
        const json = await res.json();
        if (json.data?.imageHash) {
          setExtraImages(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], hash: json.data.imageHash, preview: json.data.url || blobUrl };
            return next;
          });
        }
      } finally {
        setExtraUploading(prev => ({ ...prev, [idx]: false }));
      }
    };
    reader.readAsDataURL(file);
  }, [selectedAccountId]);

  const addExtraImage = () => setExtraImages(prev => [...prev, { url: '', hash: '', preview: '' }]);
  const removeExtraImage = (idx: number) => setExtraImages(prev => prev.filter((_, i) => i !== idx));

  // Sync extra images into form values so they reach the mutation
  const allImageHashes = [formData.imageHash, ...extraImages.map(i => i.hash)].filter(Boolean) as string[];
  const allImageUrls = [formData.imageUrl, ...extraImages.map(i => i.url)].filter(Boolean) as string[];

  // ── Lead form creation ─────────────────────────────────────────────────────

  const handleCreateLeadForm = async () => {
    if (!formName || !formPrivacyUrl || !selectedQuestions.length) {
      setCreateFormError('Form name, privacy policy URL, and at least one question are required.');
      return;
    }
    setCreatingForm(true);
    setCreateFormError('');
    try {
      const res = await fetch('/api/facebook/lead-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adAccountId: selectedAccountId,
          pageId: formData.pageId,
          name: formName,
          privacyPolicyUrl: formPrivacyUrl,
          questions: [...selectedQuestions, ...(customQuestion ? [customQuestion] : [])],
          thankYouTitle: formThankYouTitle,
          thankYouBody: formThankYouBody,
          thankYouWebsiteUrl: formThankYouUrl,
          thankYouButtonText: formThankYouUrl ? 'Visit Website' : undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to create form');
      setValue('leadFormId', json.data.id);
      setCreateFormOpen(false);
      refetchLeadForms();
    } catch (err: any) {
      setCreateFormError(err.message);
    } finally {
      setCreatingForm(false);
    }
  };

  // ── Mutation ───────────────────────────────────────────────────────────────

  const createAdMutation = useMutation({
    mutationFn: async (data: AdFormData) => {
      // Only include UTM tags for website-destination ads
      const utmParts: string[] = [];
      if (utmEnabled && data.destinationType === 'WEBSITE') {
        if (data.utmSource) utmParts.push(`utm_source=${data.utmSource}`);
        if (data.utmMedium) utmParts.push(`utm_medium=${data.utmMedium}`);
        if (data.utmCampaign) utmParts.push(`utm_campaign=${data.utmCampaign}`);
        if (data.utmContent) utmParts.push(`utm_content=${data.utmContent}`);
        if (data.utmTerm) utmParts.push(`utm_term=${data.utmTerm}`);
      }
      const body = {
        adSetId: data.adSetId,
        pageId: data.pageId,
        name: data.name,
        status: data.status,
        format: data.format,
        destinationType: data.destinationType,
        leadFormId: data.destinationType === 'INSTANT_FORM' ? data.leadFormId : undefined,
        whatsappNumber: data.destinationType === 'WHATSAPP' ? data.whatsappNumber : undefined,
        urlTags: utmParts.length ? utmParts.join('&') : undefined,
        creative: {
          // For CAROUSEL, headlines are unused (only post caption via primaryTexts[0])
          headlines: data.format !== 'CAROUSEL' ? data.headlines.map(h => h.value).filter(Boolean) : undefined,
          primaryTexts: data.primaryTexts.map(t => t.value).filter(Boolean),
          descriptions: data.format !== 'CAROUSEL' ? data.descriptions.map(d => d.value).filter(Boolean) : undefined,
          // Pass CTA for WEBSITE and INSTANT_FORM; WHATSAPP is always fixed
          callToActionType: data.destinationType !== 'WHATSAPP' ? (data.callToActionType || undefined) : undefined,
          linkUrl: data.destinationType === 'WEBSITE' ? (data.linkUrl || undefined) : undefined,
          // Primary image (always sent for backward compat)
          imageUrl: data.format === 'SINGLE_IMAGE' ? (data.imageUrl || undefined) : undefined,
          imageHash: data.format === 'SINGLE_IMAGE' ? (data.imageHash || undefined) : undefined,
          // Extra images — combined by the API into asset_feed_spec.images
          imageUrls: data.format === 'SINGLE_IMAGE' && allImageUrls.length > 1 ? allImageUrls.slice(1) : undefined,
          imageHashes: data.format === 'SINGLE_IMAGE' && allImageHashes.length > 1 ? allImageHashes.slice(1) : undefined,
          videoId: data.format === 'VIDEO' ? (data.videoId || undefined) : undefined,
          carouselCards: data.format === 'CAROUSEL' ? data.carouselCards : undefined,
        },
      };
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) {
        // Surface field-level Zod messages so the user knows exactly what to fix
        const details: any[] = json.error?.details || [];
        const fieldMessages = details.map((d: any) => d.message).filter(Boolean);
        throw new Error(fieldMessages.length ? fieldMessages.join(' · ') : (json.error?.message || 'Failed to create ad'));
      }
      return json.data;
    },
    onSuccess: () => router.push('/dashboard/ads'),
  });

  // ── Derived values ─────────────────────────────────────────────────────────

  const selectedPage = (pagesData || []).find((p: any) => p.id === formData.pageId);
  const selectedAdSet = (adSetsData || []).find((a: any) => a.id === formData.adSetId);
  const selectedLeadForm = (leadFormsData || []).find((f: any) => f.id === formData.leadFormId);

  const utmTagPreview = (() => {
    if (!utmEnabled) return '';
    const parts: string[] = [];
    if (formData.utmSource) parts.push(`utm_source=${formData.utmSource}`);
    if (formData.utmMedium) parts.push(`utm_medium=${formData.utmMedium}`);
    if (formData.utmCampaign) parts.push(`utm_campaign=${formData.utmCampaign}`);
    if (formData.utmContent) parts.push(`utm_content=${formData.utmContent}`);
    if (formData.utmTerm) parts.push(`utm_term=${formData.utmTerm}`);
    return parts.join('&');
  })();

  const activeImagePreview = imagePreview || formData.imageUrl;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Ad</h1>
        <p className="text-muted-foreground">Design and publish your ad creative</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                currentStep > step.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : currentStep === step.id
                  ? 'border-primary text-primary'
                  : 'border-muted-foreground text-muted-foreground'
              }`}>
                {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </div>
              <span className="mt-2 text-sm font-medium">{step.name}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`mx-4 h-0.5 flex-1 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="p-6">

        {/* ══ Step 1: Setup ══════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Ad Setup</h2>
              <p className="text-sm text-muted-foreground">Choose where this ad sends people</p>
            </div>

            <div className="space-y-2">
              <Label>Ad Name <span className="text-destructive">*</span></Label>
              <Input {...register('name')} placeholder="e.g., Summer Sale — Creative A" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Ad Set <span className="text-destructive">*</span></Label>
              <Select value={formData.adSetId} onValueChange={v => setValue('adSetId', v)}>
                <SelectTrigger><SelectValue placeholder="Select an ad set" /></SelectTrigger>
                <SelectContent>
                  {(adSetsData || []).map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}{a.campaign && ` (${a.campaign.name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.adSetId && <p className="text-sm text-destructive">{errors.adSetId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Facebook Page <span className="text-destructive">*</span></Label>
              <Select value={formData.pageId} onValueChange={v => setValue('pageId', v)} disabled={pagesLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={pagesLoading ? 'Loading pages…' : 'Select your Facebook Page'} />
                </SelectTrigger>
                <SelectContent>
                  {(pagesData || []).map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pageId && <p className="text-sm text-destructive">{errors.pageId.message}</p>}
              {!pagesLoading && (!pagesData || pagesData.length === 0) && (
                <p className="text-sm text-amber-600">No pages found. Make sure your token has Pages access.</p>
              )}
            </div>

            {/* Destination type */}
            <div className="space-y-2">
              <Label>Ad Destination <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-3 gap-3">
                {DESTINATION_TYPES.map(dt => (
                  <button key={dt.value} type="button"
                    onClick={() => setValue('destinationType', dt.value)}
                    className={`rounded-lg border-2 p-4 text-left transition-colors ${
                      formData.destinationType === dt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/40'
                    }`}
                  >
                    <dt.icon className={`h-5 w-5 mb-2 ${formData.destinationType === dt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="font-medium text-sm">{dt.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{dt.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Destination-specific fields */}
            {formData.destinationType === 'WEBSITE' && (
              <div className="space-y-2">
                <Label>Destination URL</Label>
                <Input {...register('linkUrl')} placeholder="https://yourwebsite.com/landing-page" type="url" />
              </div>
            )}

            {formData.destinationType === 'WHATSAPP' && (
              <div className="space-y-2">
                <Label>WhatsApp Number <span className="text-destructive">*</span></Label>
                <Input {...register('whatsappNumber')} placeholder="+386 41 123 456" />
                {errors.whatsappNumber && (
                  <p className="text-sm text-destructive">{errors.whatsappNumber.message}</p>
                )}
                <p className="text-xs text-muted-foreground">International format. Clicking the ad opens a WhatsApp chat to this number.</p>
              </div>
            )}

            {formData.destinationType === 'INSTANT_FORM' && (
              <div className="space-y-3">
                {/* Hidden input keeps leadFormId registered in RHF so trigger() validates it */}
                <input type="hidden" {...register('leadFormId')} />
                <div className="flex items-center justify-between">
                  <Label>Lead Form <span className="text-destructive">*</span></Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setCreateFormOpen(true)}
                    disabled={!formData.pageId || !selectedAccountId}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Create New Form
                  </Button>
                </div>
                {!formData.pageId && (
                  <p className="text-xs text-amber-600">Select a Facebook Page first to load or create lead forms.</p>
                )}
                {formData.pageId && (
                  <Select value={formData.leadFormId} onValueChange={v => setValue('leadFormId', v)}
                    disabled={leadFormsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={leadFormsLoading ? 'Loading forms…' : 'Select an existing form'} />
                    </SelectTrigger>
                    <SelectContent>
                      {(leadFormsData || []).map((f: any) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                          {f.leads_count != null && ` — ${f.leads_count} leads`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {!leadFormsLoading && formData.pageId && (!leadFormsData || leadFormsData.length === 0) && (
                  <p className="text-xs text-muted-foreground">No forms found on this page yet. Create one above.</p>
                )}
                {errors.leadFormId && (
                  <p className="text-sm text-destructive">{errors.leadFormId.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Initial Status</Label>
              <div className="grid grid-cols-2 gap-4">
                {(['PAUSED', 'ACTIVE'] as const).map(s => (
                  <button key={s} type="button" onClick={() => setValue('status', s)}
                    className={`rounded-lg border-2 p-4 text-left transition-colors ${formData.status === s ? 'border-primary bg-primary/5' : 'border-muted'}`}
                  >
                    <div className="font-medium capitalize">{s.toLowerCase()}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {s === 'PAUSED' ? 'Save draft, activate later' : 'Start running immediately'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ Step 2: Creative ════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Ad Creative</h2>
              <p className="text-sm text-muted-foreground">Choose a format, upload media, and write your copy</p>
            </div>

            {/* Format */}
            <div className="space-y-2">
              <Label>Ad Format</Label>
              <div className="grid grid-cols-3 gap-3">
                {AD_FORMATS.map(fmt => (
                  <button key={fmt.value} type="button" onClick={() => setValue('format', fmt.value)}
                    className={`rounded-lg border-2 p-4 text-left transition-colors ${
                      formData.format === fmt.value ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/40'
                    }`}
                  >
                    <fmt.icon className={`h-5 w-5 mb-2 ${formData.format === fmt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="font-medium text-sm">{fmt.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{fmt.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Single Image media ── */}
            {formData.format === 'SINGLE_IMAGE' && (
              <div className="space-y-2">
                <Label>Image <span className="text-destructive">*</span></Label>
                <div className="space-y-2">
                  {/* Registers imageHash in RHF so trigger() can validate it */}
                  <input type="hidden" {...register('imageHash')} />
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                  <div className="flex gap-2">
                    <Input
                      {...register('imageUrl')}
                      placeholder="https://example.com/image.jpg"
                      onChange={e => {
                        register('imageUrl').onChange(e);
                        setValue('imageHash', '');
                        setImagePreview('');
                        setUploadError('');
                        if (e.target.value) clearErrors('imageHash');
                      }}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="shrink-0"
                    >
                      {uploadingImage
                        ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />Uploading…</>
                        : <><Upload className="mr-1 h-3.5 w-3.5" />Upload</>}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste a URL or upload a file (max 30 MB). Recommended: 1200×628 px (Feed) · 1080×1080 px (Square)
                  </p>
                  {uploadError && (
                    <p className="text-sm text-destructive">{uploadError}</p>
                  )}
                  {errors.imageHash && (
                    <p className="text-sm text-destructive">{errors.imageHash.message}</p>
                  )}
                  {formData.imageHash && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Uploaded to Facebook — hash stored
                    </p>
                  )}
                  {activeImagePreview && (
                    <div className="relative rounded-lg overflow-hidden border h-36 bg-muted">
                      <img src={activeImagePreview} alt="Preview"
                        className="w-full h-full object-contain"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <button type="button" onClick={clearImage}
                        className="absolute top-1.5 right-1.5 rounded-full bg-background/80 p-0.5 hover:bg-background"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional images — enable Dynamic Creative / asset_feed_spec */}
                {extraImages.map((img, idx) => (
                  <div key={idx} className="space-y-1.5 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Image {idx + 2}</span>
                      <button type="button" onClick={() => removeExtraImage(idx)}
                        className="text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      ref={el => { extraFileInputRefs.current[idx] = el; }}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleExtraFileSelect(file, idx);
                      }}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={img.url}
                        onChange={e => setExtraImages(prev => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], url: e.target.value, hash: '', preview: '' };
                          return next;
                        })}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm"
                        onClick={() => extraFileInputRefs.current[idx]?.click()}
                        disabled={extraUploading[idx]}
                        className="shrink-0"
                      >
                        {extraUploading[idx]
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Upload className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                    {img.hash && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Uploaded
                      </p>
                    )}
                    {img.preview && (
                      <div className="rounded overflow-hidden border h-24 bg-muted">
                        <img src={img.preview} alt={`Image ${idx + 2}`} className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                ))}

                {(1 + extraImages.length) < 10 && (
                  <Button type="button" variant="outline" size="sm" onClick={addExtraImage} className="w-full">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Another Image
                    {extraImages.length === 0 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">(enables Dynamic Creative)</span>
                    )}
                  </Button>
                )}
                {(1 + extraImages.length) > 1 && (
                  <p className="text-xs text-muted-foreground">
                    {1 + extraImages.length} images — Facebook will auto-test combinations (Dynamic Creative)
                  </p>
                )}
              </div>
            )}

            {/* ── Video ── */}
            {formData.format === 'VIDEO' && (
              <div className="space-y-2">
                <Label>Facebook Video ID</Label>
                <Input {...register('videoId')} placeholder="e.g., 1234567890123456" />
                <p className="text-xs text-muted-foreground">
                  Upload your video in Facebook Business Manager → Creative Hub, then paste the numeric Video ID here.
                </p>
              </div>
            )}

            {/* ── Carousel cards ── */}
            {formData.format === 'CAROUSEL' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Cards <span className="text-xs text-muted-foreground">({cardFields.length}/10 — min 2)</span></Label>
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => addCard({ imageUrl: '', imageHash: '', headline: '', description: '', linkUrl: '' })}
                    disabled={cardFields.length >= 10}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add Card
                  </Button>
                </div>
                <div className="space-y-3">
                  {cardFields.map((field, i) => (
                    <div key={field.id} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Card {i + 1}</span>
                        {cardFields.length > 2 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeCard(i)}
                            className="h-7 px-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Image URL</Label>
                          <Input {...register(`carouselCards.${i}.imageUrl`)}
                            placeholder="https://example.com/card-image.jpg" type="url" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Headline</Label>
                          <Input {...register(`carouselCards.${i}.headline`)} placeholder="Card headline" maxLength={255} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Description</Label>
                          <Input {...register(`carouselCards.${i}.description`)} placeholder="Short description" maxLength={500} />
                        </div>
                        {formData.destinationType === 'WEBSITE' && (
                          <div className="col-span-2 space-y-1">
                            <Label className="text-xs">Link URL <span className="text-muted-foreground">(overrides global)</span></Label>
                            <Input {...register(`carouselCards.${i}.linkUrl`)} placeholder="https://yourwebsite.com/this-card" type="url" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Copy: caption for carousel, full copy for others ── */}
            {formData.format === 'CAROUSEL' ? (
              <div className="space-y-2">
                <Label>Post Caption</Label>
                <Textarea {...register('primaryTexts.0.value')}
                  placeholder="Text above the carousel…" rows={3} maxLength={2000} />
              </div>
            ) : (
              <>
                {/* Headlines */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      Headlines
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        ({headlineFields.length}/5){headlineFields.length > 1 && ' — Facebook auto-optimises'}
                      </span>
                    </Label>
                    {headlineFields.length < 5 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => addHeadline({ value: '' })}>
                        <Plus className="mr-1 h-3 w-3" /> Add variant
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {headlineFields.map((field, i) => (
                      <div key={field.id} className="flex gap-2 items-center">
                        <Input {...register(`headlines.${i}.value`)}
                          placeholder={i === 0 ? 'e.g., Transform Your Smile Today' : `Headline variant ${i + 1}`}
                          maxLength={255}
                        />
                        {headlineFields.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeHeadline(i)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary texts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Primary Text <span className="text-xs text-muted-foreground">({primaryTextFields.length}/5)</span></Label>
                    {primaryTextFields.length < 5 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => addPrimaryText({ value: '' })}>
                        <Plus className="mr-1 h-3 w-3" /> Add variant
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {primaryTextFields.map((field, i) => (
                      <div key={field.id} className="flex gap-2 items-start">
                        <Textarea {...register(`primaryTexts.${i}.value`)}
                          placeholder={i === 0 ? 'Write compelling copy…' : `Text variant ${i + 1}`}
                          rows={3} maxLength={2000} className="flex-1"
                        />
                        {primaryTextFields.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removePrimaryText(i)} className="mt-1">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Descriptions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Descriptions <span className="text-xs text-muted-foreground">Optional ({descFields.length}/5)</span></Label>
                    {descFields.length < 5 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => addDesc({ value: '' })}>
                        <Plus className="mr-1 h-3 w-3" /> Add
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {descFields.map((field, i) => (
                      <div key={field.id} className="flex gap-2 items-center">
                        <Input {...register(`descriptions.${i}.value`)} placeholder={`Description ${i + 1}`} maxLength={500} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeDesc(i)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* CTA (context-aware) */}
            <div className="grid grid-cols-2 gap-4">
              {formData.destinationType === 'WEBSITE' && (
                <div className="space-y-2">
                  <Label>Call to Action</Label>
                  <Select value={formData.callToActionType} onValueChange={v => setValue('callToActionType', v)}>
                    <SelectTrigger><SelectValue placeholder="Select CTA" /></SelectTrigger>
                    <SelectContent>
                      {CTA_TYPES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.destinationType === 'INSTANT_FORM' && (
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Select value={formData.callToActionType || 'SIGN_UP'} onValueChange={v => setValue('callToActionType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEAD_FORM_CTAS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.destinationType === 'WHATSAPP' && (
                <div className="space-y-2">
                  <Label>Button</Label>
                  <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">
                    Send Message (fixed for WhatsApp)
                  </div>
                </div>
              )}

              {formData.destinationType === 'WEBSITE' && formData.format === 'CAROUSEL' && (
                <div className="space-y-2">
                  <Label>Default Link URL</Label>
                  <Input {...register('linkUrl')} placeholder="https://yourwebsite.com/landing-page" type="url" />
                </div>
              )}
            </div>

            {/* UTM Tracking */}
            {formData.destinationType === 'WEBSITE' && (
              <div className="rounded-lg border overflow-hidden">
                <button type="button" onClick={() => setUtmEnabled(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    URL Tracking (UTM Parameters)
                    {utmEnabled && (
                      <span className="text-xs font-normal text-primary bg-primary/10 px-1.5 py-0.5 rounded">enabled</span>
                    )}
                  </span>
                  {utmEnabled
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {utmEnabled && (
                  <div className="border-t p-4 space-y-4 bg-muted/20">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Appended to every URL in this ad. Use dynamic values:{' '}
                      {['{{campaign.name}}', '{{adset.name}}', '{{ad.name}}', '{{placement}}'].map(tag => (
                        <code key={tag} className="bg-muted px-1 py-0.5 rounded font-mono text-xs mx-0.5">{tag}</code>
                      ))}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">utm_source</Label>
                        <Input {...register('utmSource')} placeholder="facebook" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">utm_medium</Label>
                        <Input {...register('utmMedium')} placeholder="paid_social" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">utm_campaign</Label>
                        <Input {...register('utmCampaign')} placeholder="{{campaign.name}}" className="h-8 text-sm font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">utm_content</Label>
                        <Input {...register('utmContent')} placeholder="{{adset.name}}" className="h-8 text-sm font-mono" />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs">utm_term <span className="text-muted-foreground">(optional)</span></Label>
                        <Input {...register('utmTerm')} placeholder="{{ad.name}}" className="h-8 text-sm font-mono" />
                      </div>
                    </div>
                    {utmTagPreview && (
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Preview</Label>
                        <div className="rounded bg-muted px-3 py-2 text-xs font-mono break-all text-muted-foreground">
                          ?{utmTagPreview}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ Step 3: Review ══════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Review & Create</h2>

            {createAdMutation.isError && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                {createAdMutation.error instanceof Error
                  ? createAdMutation.error.message
                  : 'Failed to create ad'}
              </div>
            )}

            {/* Preview — single image */}
            {formData.format === 'SINGLE_IMAGE' && (formData.headlines[0]?.value || formData.primaryTexts[0]?.value) && (
              <div className="rounded-lg border-2 border-dashed border-muted p-4">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Ad Preview</p>
                {activeImagePreview && (
                  <div className="mb-3 rounded overflow-hidden bg-muted h-40">
                    <img src={activeImagePreview} alt="Ad" className="w-full h-full object-cover" />
                  </div>
                )}
                {formData.primaryTexts[0]?.value && <p className="text-sm mb-3">{formData.primaryTexts[0].value}</p>}
                <div className="flex items-center justify-between border-t pt-2">
                  <div>
                    {formData.headlines[0]?.value && <p className="font-semibold text-sm">{formData.headlines[0].value}</p>}
                    {formData.descriptions[0]?.value && <p className="text-xs text-muted-foreground">{formData.descriptions[0].value}</p>}
                  </div>
                  {formData.destinationType === 'WHATSAPP' ? (
                    <span className="rounded bg-[#25D366] px-3 py-1 text-xs font-semibold text-white">Send Message</span>
                  ) : formData.callToActionType && formData.callToActionType !== 'NO_BUTTON' ? (
                    <span className="rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {CTA_TYPES.find(c => c.value === formData.callToActionType)?.label}
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            {/* Preview — carousel */}
            {formData.format === 'CAROUSEL' && (
              <div className="rounded-lg border-2 border-dashed border-muted p-4">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Carousel Preview</p>
                {formData.primaryTexts[0]?.value && <p className="text-sm mb-3">{formData.primaryTexts[0].value}</p>}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {formData.carouselCards.map((card, i) => (
                    <div key={i} className="flex-none w-36 rounded-lg border overflow-hidden bg-muted">
                      {card.imageUrl
                        ? <img src={card.imageUrl} alt={`Card ${i + 1}`} className="h-24 w-full object-cover" />
                        : <div className="h-24 flex items-center justify-center text-xs text-muted-foreground">No image</div>}
                      <div className="p-2">
                        <p className="text-xs font-medium truncate">{card.headline || `Card ${i + 1}`}</p>
                        {card.description && <p className="text-xs text-muted-foreground truncate">{card.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary table */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Ad Name', value: formData.name },
                  { label: 'Ad Set', value: selectedAdSet?.name },
                  { label: 'Facebook Page', value: selectedPage?.name },
                  { label: 'Format', value: AD_FORMATS.find(f => f.value === formData.format)?.label },
                  { label: 'Destination', value: DESTINATION_TYPES.find(d => d.value === formData.destinationType)?.label },
                  { label: 'Status', value: formData.status?.toLowerCase() },
                  formData.destinationType === 'WEBSITE' ? { label: 'URL', value: formData.linkUrl } : null,
                  formData.destinationType === 'WHATSAPP' ? { label: 'WhatsApp', value: formData.whatsappNumber } : null,
                  formData.destinationType === 'INSTANT_FORM' ? { label: 'Lead Form', value: selectedLeadForm?.name } : null,
                  utmEnabled && utmTagPreview ? { label: 'UTM Tags', value: `?${utmTagPreview}` } : null,
                ].filter(Boolean).filter(i => i!.value).map(({ label, value }: any) => (
                  <div key={label}>
                    <div className="text-xs font-medium text-muted-foreground">{label}</div>
                    <div className="text-sm font-medium break-all">{value}</div>
                  </div>
                ))}
              </div>

              {formData.format !== 'CAROUSEL' && (
                <div className="space-y-3 pt-3 border-t">
                  {formData.headlines.some(h => h.value) && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Headlines ({formData.headlines.filter(h => h.value).length})
                      </div>
                      <ul className="space-y-0.5">
                        {formData.headlines.filter(h => h.value).map((h, i) => (
                          <li key={i} className="text-sm">• {h.value}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {formData.primaryTexts.some(t => t.value) && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Primary Texts ({formData.primaryTexts.filter(t => t.value).length})
                      </div>
                      <ul className="space-y-0.5">
                        {formData.primaryTexts.filter(t => t.value).map((t, i) => (
                          <li key={i} className="text-sm">• {t.value}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {formData.format === 'CAROUSEL' && (
                <div className="pt-3 border-t">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Cards ({formData.carouselCards?.length})</div>
                  {formData.carouselCards?.map((card, i) => (
                    <div key={i} className="text-sm text-muted-foreground">
                      Card {i + 1}: {card.headline || 'no headline'}
                      {card.linkUrl ? ` → ${card.linkUrl}` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button type="button" variant="outline"
            onClick={() => currentStep > 1 && setCurrentStep(s => s - 1)}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentStep < STEPS.length ? (
            <Button type="button" onClick={async () => {
              if (currentStep === 1) {
                const fields: (keyof AdFormData)[] = ['name', 'adSetId', 'pageId'];
                if (formData.destinationType === 'WHATSAPP') fields.push('whatsappNumber');
                if (formData.destinationType === 'INSTANT_FORM') fields.push('leadFormId');
                const valid = await trigger(fields);
                if (!valid) return;
              }
              if (currentStep === 2) {
                const fields: (keyof AdFormData)[] = ['headlines', 'primaryTexts'];
                if (formData.format === 'VIDEO') fields.push('videoId');
                const valid = await trigger(fields);
                if (!valid) return;
                // superRefine can't fire on field-level triggers — check image manually
                if (formData.format === 'SINGLE_IMAGE') {
                  const hasImage = formData.imageHash || formData.imageUrl || extraImages.length > 0;
                  if (!hasImage) {
                    setError('imageHash', { type: 'manual', message: 'At least one image is required for Single Image ads' });
                    return;
                  }
                  clearErrors('imageHash');
                }
              }
              setCurrentStep(s => s + 1);
            }}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button"
              onClick={() => handleSubmit(d => createAdMutation.mutate(d))()}
              disabled={createAdMutation.isPending}
            >
              {createAdMutation.isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</>
                : <><Check className="mr-2 h-4 w-4" />Create Ad</>}
            </Button>
          )}
        </div>
      </Card>

      {/* ══ Create Lead Form Dialog ══════════════════════════════════════════════ */}
      <Dialog open={createFormOpen} onOpenChange={setCreateFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Instant Form</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {createFormError && (
              <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">{createFormError}</div>
            )}

            <div className="space-y-1.5">
              <Label>Form Name <span className="text-destructive">*</span></Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g., Dental Consultation Request" />
            </div>

            <div className="space-y-1.5">
              <Label>Privacy Policy URL <span className="text-destructive">*</span></Label>
              <Input value={formPrivacyUrl} onChange={e => setFormPrivacyUrl(e.target.value)}
                placeholder="https://yourwebsite.com/privacy" type="url" />
            </div>

            <div className="space-y-2">
              <Label>Questions <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-2 gap-2">
                {LEAD_QUESTION_OPTIONS.map(q => (
                  <label key={q.value} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(q.value)}
                      onChange={e => {
                        setSelectedQuestions(prev =>
                          e.target.checked ? [...prev, q.value] : prev.filter(v => v !== q.value)
                        );
                      }}
                      className="rounded"
                    />
                    {q.label}
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input value={customQuestion} onChange={e => setCustomQuestion(e.target.value)}
                  placeholder="Custom question label…" className="h-8 text-sm" />
              </div>
              <p className="text-xs text-muted-foreground">Custom question will appear as a free-text field.</p>
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <Label className="text-sm">Thank You Page</Label>
              <div className="space-y-1.5">
                <Label className="text-xs">Title</Label>
                <Input value={formThankYouTitle} onChange={e => setFormThankYouTitle(e.target.value)}
                  placeholder="Thank you!" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Body</Label>
                <Textarea value={formThankYouBody} onChange={e => setFormThankYouBody(e.target.value)}
                  placeholder="We'll be in touch." rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Website URL (optional — shows a Visit Website button)</Label>
                <Input value={formThankYouUrl} onChange={e => setFormThankYouUrl(e.target.value)}
                  placeholder="https://yourwebsite.com" type="url" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFormOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateLeadForm} disabled={creatingForm}>
              {creatingForm ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> : 'Create Form'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function NewAdPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12"><span className="text-muted-foreground">Loading…</span></div>}>
      <NewAdPageInner />
    </Suspense>
  );
}
