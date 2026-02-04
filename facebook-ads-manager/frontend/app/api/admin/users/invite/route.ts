import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"

import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/db"
import { z } from "zod"

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
})

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
    const { email, role } = inviteSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "User with this email already exists",
            code: "USER_EXISTS",
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      data: {
        email,
        role,
        invitedBy: session.user.email,
      },
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
