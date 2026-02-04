import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"

import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/db"
import { z } from "zod"

const settingsSchema = z.object({
  performanceRetentionDays: z.number().min(30).max(730),
  features: z.object({
    aiRecommendations: z.boolean(),
    abTesting: z.boolean(),
  }),
  customCategories: z.array(z.string()),
  defaultFieldValues: z.record(z.string()),
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

    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    })

    if (!organization) {
      return NextResponse.json(
        { success: false, error: { message: "Organization not found", code: "NOT_FOUND" } },
        { status: 404 }
      )
    }

    const settings = {
      performanceRetentionDays: 365,
      features: {
        aiRecommendations: true,
        abTesting: false,
      },
      customCategories: [],
      defaultFieldValues: {},
    }

    return NextResponse.json({
      success: true,
      data: settings,
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

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = settingsSchema.parse(body)

    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    })

    if (!organization) {
      return NextResponse.json(
        { success: false, error: { message: "Organization not found", code: "NOT_FOUND" } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: validatedData,
      message: "Settings updated successfully",
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
