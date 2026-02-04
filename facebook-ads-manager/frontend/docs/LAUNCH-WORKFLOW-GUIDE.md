# Launch Workflow Developer Guide

## Quick Start

To launch a campaign from a template:

```typescript
// Navigate to launch page
router.push('/dashboard/campaigns/launch');
```

## Component Architecture

```
LaunchPage (page.tsx)
├── LaunchProgress (Step Indicator)
├── Card (Step Container)
│   ├── Step 1: TemplateSelector
│   ├── Step 2: DynamicFieldsForm
│   ├── Step 3: CampaignName + TargetingBudgetForm
│   └── Step 4: CampaignTemplatePreview
└── LaunchNavigation (Back/Next/Launch Buttons)
```

## State Management

### Main Page State
```typescript
const [currentStep, setCurrentStep] = useState(1);
const [selectedTemplate, setSelectedTemplate] = useState<AdTemplate | null>(null);
const [campaignName, setCampaignName] = useState('');
const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
const [fieldValuesValid, setFieldValuesValid] = useState(false);
const [targeting, setTargeting] = useState<TargetingConfig>({
  locations: ['US'],
  ageMin: 18,
  ageMax: 65,
});
const [budget, setBudget] = useState<BudgetConfig>({
  budgetType: 'daily',
  budget: 50,
});
const [targetingBudgetValid, setTargetingBudgetValid] = useState(true);
```

## Component Props Reference

### LaunchProgress
```typescript
interface LaunchProgressProps {
  currentStep: number;           // Current step (1-4)
  steps: Array<{                 // Step definitions
    id: number;
    title: string;
  }>;
  onStepClick?: (step: number) => void;  // Navigate to step
}
```

### LaunchNavigation
```typescript
interface LaunchNavigationProps {
  currentStep: number;           // Current step
  totalSteps: number;            // Total steps (4)
  onBack: () => void;            // Go to previous step
  onNext: () => void;            // Go to next step
  onLaunch: () => void;          // Launch campaign
  isNextDisabled?: boolean;      // Disable next/launch
  isLoading?: boolean;           // Show loading state
  error?: string | null;         // Display error message
}
```

### TemplateSelector
```typescript
interface TemplateSelectorProps {
  templates: Array<AdTemplate & {
    performanceAggregate?: {
      avgRoas: number | null;
      avgCtr: number | null;
      avgCpc: number | null;
      accountsUsing: number;
    } | null;
  }>;
  onSelectTemplate: (template: AdTemplate) => void;
  onPreview?: (template: AdTemplate) => void;  // Optional preview
  isLoading?: boolean;
}
```

### DynamicFieldsForm
```typescript
interface DynamicFieldsFormProps {
  fields: DynamicField[];        // Field definitions from template
  initialValues?: Record<string, any>;
  onChange: (
    values: Record<string, any>,
    isValid: boolean
  ) => void;
}
```

### TargetingBudgetForm
```typescript
interface TargetingBudgetFormProps {
  initialTargeting?: Partial<TargetingConfig>;
  initialBudget?: Partial<BudgetConfig>;
  onChange: (
    targeting: TargetingConfig,
    budget: BudgetConfig,
    isValid: boolean
  ) => void;
}
```

### CampaignTemplatePreview
```typescript
interface CampaignTemplatePreviewProps {
  template: AdTemplate;          // Selected template
  fieldValues: Record<string, any>;  // Resolved field values
  targeting: TargetingConfig;    // Targeting configuration
  budget: BudgetConfig;          // Budget configuration
  campaignName: string;          // Campaign name
}
```

## API Integration

### Launch Endpoint

**Endpoint:** `POST /api/campaigns/launch`

**Request Body:**
```typescript
{
  templateId: string;
  adAccountId: string;
  campaignName: string;
  fieldValues: Record<string, any>;
  targeting: {
    locations: string[];
    ageMin?: number;
    ageMax?: number;
    genders?: ('male' | 'female' | 'all')[];
    interests?: string[];
    behaviors?: string[];
  };
  budget: {
    budgetType: 'daily' | 'lifetime';
    budget: number;
    startTime?: string;
    stopTime?: string;
    bidStrategy?: string;
  };
}
```

**Success Response (201):**
```typescript
{
  success: true;
  campaign: {
    id: string;
    name: string;
    status: string;
    objective: string;
    message: string;
  };
}
```

**Error Response (400/401/403/500):**
```typescript
{
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }> | any;
}
```

## Validation Flow

### Step 1 Validation
```typescript
isValid = selectedTemplate !== null;
```

### Step 2 Validation
```typescript
// If no dynamic fields, automatically valid
if (dynamicFields.length === 0) {
  isValid = true;
} else {
  // Use Zod schema validation
  isValid = fieldValuesValid;  // Set by DynamicFieldsForm
}
```

### Step 3 Validation
```typescript
isValid =
  campaignName.trim().length > 0 &&
  targetingBudgetValid;  // Set by TargetingBudgetForm
```

### Step 4 Validation
```typescript
isValid = true;  // Always valid (review step)
```

## Extending the Workflow

### Adding a New Step

1. Add step definition:
```typescript
const STEPS = [
  { id: 1, title: 'Select Template' },
  { id: 2, title: 'Fill Fields' },
  { id: 3, title: 'Configure' },
  { id: 4, title: 'Preview' },
  { id: 5, title: 'New Step' },  // Add here
];
```

2. Add step content in page.tsx:
```typescript
{currentStep === 5 && (
  <div>
    {/* Your new step component */}
  </div>
)}
```

3. Update validation:
```typescript
const isStepValid = () => {
  switch (currentStep) {
    // ... existing cases
    case 5:
      return yourNewValidationLogic();
    default:
      return false;
  }
};
```

### Adding a New Field Type

1. Update DynamicField type in `/lib/templates/dynamic-fields.ts`:
```typescript
export interface DynamicField {
  name: string;
  type: 'text' | 'number' | 'url' | 'date';  // Add 'date'
  // ...
}
```

2. Update Zod schema generation in `dynamic-fields-form.tsx`:
```typescript
case 'date':
  fieldSchema = z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    'Invalid date'
  );
  break;
```

3. Add input rendering:
```typescript
{field.type === 'date' && (
  <Input
    type="date"
    {...register(field.name)}
    // ... props
  />
)}
```

### Adding Custom Validation

1. Extend validation in `targeting-budget-form.tsx`:
```typescript
const schema = z.object({
  // ... existing fields
  customField: z.string()
    .min(5, 'Minimum 5 characters')
    .refine(
      (val) => customValidationLogic(val),
      'Custom error message'
    ),
});
```

2. Cross-field validation:
```typescript
const schema = z.object({
  field1: z.string(),
  field2: z.string(),
}).refine((data) => data.field1 !== data.field2, {
  message: 'Fields must be different',
  path: ['field2'],  // Error on field2
});
```

## Debugging Tips

### Enable Form State Logging
```typescript
// In any form component
const formValues = watch();
useEffect(() => {
  // Only for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Form values:', formValues);
    console.log('Form errors:', errors);
  }
}, [formValues, errors]);
```

### Check Validation State
```typescript
// In main page
useEffect(() => {
  console.log('Step valid:', isStepValid());
  console.log('Field values valid:', fieldValuesValid);
  console.log('Targeting/budget valid:', targetingBudgetValid);
}, [currentStep, fieldValuesValid, targetingBudgetValid]);
```

### Test API Endpoint
```bash
# Test launch endpoint
curl -X POST http://localhost:3001/api/campaigns/launch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "templateId": "template-id",
    "adAccountId": "act_123",
    "campaignName": "Test Campaign",
    "fieldValues": {},
    "targeting": {
      "locations": ["US"],
      "ageMin": 18,
      "ageMax": 65
    },
    "budget": {
      "budgetType": "daily",
      "budget": 50
    }
  }'
```

## Common Issues

### Issue: Dynamic fields not validating
**Solution:** Check that `dynamicFields` array is properly parsed from template:
```typescript
const dynamicFields = selectedTemplate
  ? parseFieldDefinitions(selectedTemplate.dynamicFields)
  : [];
```

### Issue: Navigation disabled when it shouldn't be
**Solution:** Debug `isStepValid()` function:
```typescript
const isStepValid = () => {
  const valid = /* your logic */;
  console.log('Step', currentStep, 'valid:', valid);
  return valid;
};
```

### Issue: Template preview not showing dynamic fields
**Solution:** Ensure fieldValues are being passed correctly:
```typescript
<CampaignTemplatePreview
  template={selectedTemplate}
  fieldValues={fieldValues}  // Must be populated
  // ...
/>
```

### Issue: API returning 401 Unauthorized
**Solution:** Check NextAuth session:
```typescript
// In API route
const session = await getServerSession();
console.log('Session:', session);  // Should have user
```

## Performance Optimization

### Memoize Expensive Calculations
```typescript
const dynamicFields = useMemo(
  () => selectedTemplate
    ? parseFieldDefinitions(selectedTemplate.dynamicFields)
    : [],
  [selectedTemplate]
);
```

### Debounce Form Changes
```typescript
// React Hook Form handles this automatically with mode: 'onChange'
// For custom debouncing:
import { useDebouncedCallback } from 'use-debounce';

const debouncedOnChange = useDebouncedCallback(
  (values) => {
    // Handle change
  },
  300
);
```

### Lazy Load Components
```typescript
import dynamic from 'next/dynamic';

const CampaignTemplatePreview = dynamic(
  () => import('@/components/campaigns/campaign-template-preview'),
  { loading: () => <LoadingSpinner /> }
);
```

## Testing

### Unit Test Example
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LaunchProgress } from '@/components/campaigns/launch-progress';

describe('LaunchProgress', () => {
  it('highlights current step', () => {
    const steps = [
      { id: 1, title: 'Step 1' },
      { id: 2, title: 'Step 2' },
    ];

    render(
      <LaunchProgress currentStep={1} steps={steps} />
    );

    const step1 = screen.getByLabelText('Step 1: Step 1');
    expect(step1).toHaveClass('border-primary');
  });
});
```

### Integration Test Example
```typescript
import { renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { generateZodSchema } from '@/components/campaigns/dynamic-fields-form';

describe('DynamicFieldsForm', () => {
  it('validates required fields', () => {
    const fields = [
      { name: 'test', type: 'text', required: true }
    ];

    const schema = generateZodSchema(fields);
    const result = schema.safeParse({ test: '' });

    expect(result.success).toBe(false);
  });
});
```

## Best Practices

1. **Always validate on both client and server**
2. **Use TypeScript for type safety**
3. **Handle loading and error states**
4. **Provide clear user feedback**
5. **Make forms accessible (ARIA labels, etc.)**
6. **Test with various template configurations**
7. **Keep components focused and reusable**
8. **Document complex logic**
9. **Use semantic HTML**
10. **Follow existing code patterns**

## Resources

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [ShadCN UI Components](https://ui.shadcn.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TanStack Query](https://tanstack.com/query/latest)

---

**Last Updated:** January 27, 2026
**Maintained By:** ORCHESTRAI Development Team
