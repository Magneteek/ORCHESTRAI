import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  objective: z.string().optional(),
  visibility: z.string().optional(),
  isGlobal: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  adCopy: z.any().optional(),
  creativeSpecs: z.any().optional(),
  targetingConfig: z.any().optional(),
  campaignStructure: z.any().optional(),
  dynamicFields: z.any().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateTemplateSchema.parse(body)

    const existingTemplate = await prisma.adTemplate.findUnique({
      where: { id },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: { message: "Template not found", code: "NOT_FOUND" } },
        { status: 404 }
      )
    }

    const template = await prisma.adTemplate.update({
      where: { id },
      data: validatedData,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 }
      )
    }

    const { id } = await params

    const existingTemplate = await prisma.adTemplate.findUnique({
      where: { id },
      include: {
        campaigns: true,
      },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: { message: "Template not found", code: "NOT_FOUND" } },
        { status: 404 }
      )
    }

    await prisma.adTemplate.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
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
