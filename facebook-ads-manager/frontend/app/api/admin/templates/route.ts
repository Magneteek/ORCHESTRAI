import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"

import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.string(),
  objective: z.string(),
  visibility: z.string(),
  isGlobal: z.boolean(),
  isFeatured: z.boolean().optional(),
  adCopy: z.object({
    headline: z.string(),
    primaryText: z.string(),
    description: z.string().optional(),
    callToAction: z.string(),
  }),
  creativeSpecs: z.any(),
  targetingConfig: z.any(),
  campaignStructure: z.any(),
  dynamicFields: z.object({
    fields: z.array(z.any()),
  }).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const isGlobal = searchParams.get("isGlobal")
    const category = searchParams.get("category")

    const where: any = {
      organizationId: session.user.organizationId,
    }

    if (isGlobal === "true") {
      where.isGlobal = true
    } else if (isGlobal === "false") {
      where.isGlobal = false
    }

    if (category) {
      where.category = category
    }

    const templates = await prisma.adTemplate.findMany({
      where,
      include: {
        performanceAggregate: true,
        _count: {
          select: {
            campaigns: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: templates,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Internal server error",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createTemplateSchema.parse(body)

    const template = await prisma.adTemplate.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        objective: validatedData.objective,
        visibility: validatedData.visibility,
        isGlobal: validatedData.isGlobal,
        adCopy: validatedData.adCopy as any,
        creativeSpecs: validatedData.creativeSpecs,
        targetingConfig: validatedData.targetingConfig,
        campaignStructure: validatedData.campaignStructure,
        dynamicFields: validatedData.dynamicFields as any,
        organizationId: session.user.organizationId,
      },
      include: {
        performanceAggregate: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Validation error",
            code: "VALIDATION_ERROR",
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Internal server error",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    )
  }
}
