import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleTemplates = [
  {
    name: 'E-commerce Product Launch',
    description: 'Perfect for launching new products with discount offers',
    category: 'e-commerce',
    objective: 'OUTCOME_SALES',
    visibility: 'public',
    isPublic: true,
    isGlobal: true,
    adCopy: {
      headline: '{{productName}} - {{discount}}% Off Today!',
      primaryText: 'Introducing {{productName}} - the solution you\'ve been waiting for. Limited time offer: {{discount}}% off for early adopters!',
      description: 'Premium quality at unbeatable prices. Shop now!',
      callToAction: 'SHOP_NOW',
    },
    creativeSpecs: {
      format: 'SINGLE_IMAGE',
      dimensions: '1080x1080',
      imageUrl: 'https://via.placeholder.com/1080x1080/FF6B6B/FFFFFF?text=Product+Image',
    },
    targetingConfig: {
      interests: ['Shopping and fashion', 'Online shopping'],
      ageMin: 25,
      ageMax: 55,
      genders: ['all'],
    },
    campaignStructure: {
      dailyBudget: 50,
      bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
      placements: ['facebook_feed', 'instagram_feed'],
    },
    dynamicFields: {
      fields: [
        {
          name: 'productName',
          type: 'text',
          required: true,
          placeholder: 'e.g., Wireless Headphones',
        },
        {
          name: 'discount',
          type: 'number',
          required: true,
          defaultValue: 20,
          placeholder: 'e.g., 20',
        },
      ],
    },
  },
  {
    name: 'Lead Generation - Free Guide',
    description: 'Capture leads by offering valuable content',
    category: 'lead-generation',
    objective: 'OUTCOME_LEADS',
    visibility: 'public',
    isPublic: true,
    isGlobal: true,
    adCopy: {
      headline: 'Free {{guideTitle}} - Download Now',
      primaryText: 'Get your free {{guideTitle}} and learn {{benefitDescription}}. No credit card required!',
      description: 'Expert insights delivered to your inbox',
      callToAction: 'DOWNLOAD',
    },
    creativeSpecs: {
      format: 'SINGLE_IMAGE',
      dimensions: '1200x628',
      imageUrl: 'https://via.placeholder.com/1200x628/4ECDC4/FFFFFF?text=Free+Guide',
    },
    targetingConfig: {
      interests: ['Business', 'Entrepreneurship'],
      ageMin: 30,
      ageMax: 60,
    },
    campaignStructure: {
      dailyBudget: 30,
      bidStrategy: 'LOWEST_COST_WITH_BID_CAP',
      bidAmount: 2.5,
    },
    dynamicFields: {
      fields: [
        {
          name: 'guideTitle',
          type: 'text',
          required: true,
          placeholder: 'e.g., Ultimate SEO Guide 2024',
        },
        {
          name: 'benefitDescription',
          type: 'text',
          required: true,
          placeholder: 'e.g., how to rank #1 on Google',
        },
      ],
    },
  },
  {
    name: 'Local Business - Special Offer',
    description: 'Drive foot traffic to your local business',
    category: 'local-business',
    objective: 'OUTCOME_TRAFFIC',
    visibility: 'public',
    isPublic: true,
    isGlobal: true,
    adCopy: {
      headline: '{{businessName}} - {{offerDescription}}',
      primaryText: 'Visit us today! {{offerDescription}}. Located at {{location}}.',
      description: 'Limited time offer for local customers',
      callToAction: 'GET_DIRECTIONS',
    },
    creativeSpecs: {
      format: 'SINGLE_IMAGE',
      dimensions: '1080x1080',
      imageUrl: 'https://via.placeholder.com/1080x1080/FFE66D/000000?text=Local+Business',
    },
    targetingConfig: {
      radius: 10,
      radiusUnit: 'mi',
      ageMin: 18,
      ageMax: 65,
    },
    campaignStructure: {
      dailyBudget: 25,
      bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
    },
    dynamicFields: {
      fields: [
        {
          name: 'businessName',
          type: 'text',
          required: true,
          placeholder: 'Your business name',
        },
        {
          name: 'offerDescription',
          type: 'text',
          required: true,
          placeholder: 'e.g., 30% off all services',
        },
        {
          name: 'location',
          type: 'text',
          required: true,
          placeholder: 'e.g., 123 Main St',
        },
      ],
    },
  },
  {
    name: 'Brand Awareness - Video',
    description: 'Increase brand reach with engaging video content',
    category: 'brand-awareness',
    objective: 'OUTCOME_AWARENESS',
    visibility: 'public',
    isPublic: true,
    isGlobal: true,
    adCopy: {
      headline: '{{brandMessage}}',
      primaryText: 'Discover {{brandName}} - {{uniqueValueProp}}',
      description: 'Watch our story',
      callToAction: 'WATCH_MORE',
    },
    creativeSpecs: {
      format: 'VIDEO',
      dimensions: '1080x1920',
      duration: 15,
    },
    targetingConfig: {
      interests: ['Technology', 'Innovation'],
      ageMin: 18,
      ageMax: 45,
    },
    campaignStructure: {
      dailyBudget: 100,
      bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
      optimizationGoal: 'VIDEO_VIEWS',
    },
    dynamicFields: {
      fields: [
        {
          name: 'brandName',
          type: 'text',
          required: true,
          placeholder: 'Your brand name',
        },
        {
          name: 'brandMessage',
          type: 'text',
          required: true,
          placeholder: 'e.g., Innovation Starts Here',
        },
        {
          name: 'uniqueValueProp',
          type: 'text',
          required: true,
          placeholder: 'What makes you unique',
        },
      ],
    },
  },
];

async function seedTemplates() {
  console.log('🌱 Seeding sample templates...\n');

  // Get first organization
  const org = await prisma.organization.findFirst();

  if (!org) {
    console.log('❌ No organization found. Create a user first.');
    return;
  }

  console.log(`📊 Using organization: ${org.id}\n`);

  for (const template of sampleTemplates) {
    console.log(`Creating: ${template.name}...`);

    await prisma.adTemplate.create({
      data: {
        ...template,
        organizationId: org.id,
      } as any,
    });

    console.log(`✅ Created\n`);
  }

  console.log(`✨ Successfully seeded ${sampleTemplates.length} templates!`);

  await prisma.$disconnect();
}

seedTemplates().catch(console.error);
