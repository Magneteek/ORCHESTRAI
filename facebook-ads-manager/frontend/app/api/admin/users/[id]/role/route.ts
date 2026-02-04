import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
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

    if (id === session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "You cannot change your own role",
            code: "FORBIDDEN",
          },
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { role } = updateRoleSchema.parse(body)

    const targetUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: { message: "User not found", code: "NOT_FOUND" } },
        { status: 404 }
      )
    }

    if (targetUser.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "User not in your organization",
            code: "FORBIDDEN",
          },
        },
        { status: 403 }
      )
    }

    if (targetUser.role === UserRole.ADMIN && role === UserRole.USER) {
      const adminCount = await prisma.user.count({
        where: {
          organizationId: session.user.organizationId,
          role: UserRole.ADMIN,
        },
      })

      if (adminCount === 1) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Cannot demote the last admin. Promote another user to admin first.",
              code: "LAST_ADMIN",
            },
          },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
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
