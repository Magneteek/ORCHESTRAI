import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { validateFieldValues, parseFieldDefinitions } from '@/lib/templates/dynamic-fields';
import { launchCampaignFromTemplate, validateLaunchConfig } from '@/lib/templates/launch';
import { ValidationError } from '@/lib/utils/errors';

const launchSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  adAccountId: z.string().min(1, 'Ad account ID is required'),
  campaignName: z.string().min(1, 'Campaign name is required'),
  fieldValues: z.record(z.any()),
  targeting: z.object({
    locations: z.array(z.string()).min(1, 'At least one location is required'),
    ageMin: z.number().min(13).max(65).optional(),
    ageMax: z.number().min(13).max(65).optional(),
    genders: z.array(z.enum(['male', 'female', 'all'])).optional(),
    interests: z.array(z.string()).optional(),
    behaviors: z.array(z.string()).optional(),
  }),
  budget: z.object({
    budgetType: z.enum(['daily', 'lifetime']),
    budget: z.number().min(1, 'Budget must be at least $1'),
    startTime: z.string().optional(),
    stopTime: z.string().optional(),
    bidStrategy: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validatedData = launchSchema.parse(body);

    // 3. Fetch template from database
    const template = await prisma.adTemplate.findUnique({
      where: { id: validatedData.templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // 4. Verify user has access to the ad account
    const adAccount = await prisma.adAccount.findFirst({
      where: {
        id: validatedData.adAccountId,
        facebookBusinessAccount: {
          organizationId: session.user.organizationId as string,
        },
      },
    });

    if (!adAccount) {
      return NextResponse.json(
        { error: 'Ad account not found or access denied' },
        { status: 403 }
      );
    }

    // 5. Parse and validate dynamic field definitions
    const dynamicFields = parseFieldDefinitions(template.dynamicFields);

    // 6. Validate field values
    const fieldValidation = validateFieldValues(
      dynamicFields,
      validatedData.fieldValues
    );

    if (!fieldValidation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid field values',
          details: fieldValidation.errors,
        },
        { status: 400 }
      );
    }

    // 7. Validate launch configuration
    const launchValidation = validateLaunchConfig(
      {
        campaignName: validatedData.campaignName,
        fieldValues: validatedData.fieldValues,
        targeting: validatedData.targeting,
        budget: validatedData.budget,
      },
      template,
      dynamicFields
    );

    if (!launchValidation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid launch configuration',
          details: launchValidation.errors,
        },
        { status: 400 }
      );
    }

    // 8. Launch campaign from template
    const campaign = await launchCampaignFromTemplate(
      validatedData.templateId,
      validatedData.adAccountId,
      session.user.id as string,
      {
        campaignName: validatedData.campaignName,
        fieldValues: validatedData.fieldValues,
        targeting: validatedData.targeting,
        budget: validatedData.budget,
      }
    );

    // 9. Save campaign to database (for now, just return the stub)
    // TODO: In Phase 5, this will actually create the campaign in Facebook
    // and save it to the database

    return NextResponse.json(
      {
        success: true,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
          message:
            'Campaign created successfully. Phase 5 will implement Facebook API integration.',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
