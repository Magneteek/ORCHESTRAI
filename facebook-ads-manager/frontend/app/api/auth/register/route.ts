import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { registerSchema } from '@/lib/utils/validation';
import { createUser } from '@/lib/db/users';
import { createOrganization } from '@/lib/db/organizations';
import { prisma } from '@/lib/db/prisma';
import { ZodError } from 'zod';
import { ValidationError } from '@/lib/utils/errors';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const data = registerSchema.parse(body);

    // Generate organization slug from name
    const slug = data.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName,
          slug,
          plan: 'free',
        },
      });

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: UserRole.ADMIN,
          organizationId: organization.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
          createdAt: true,
        },
      });

      return { user, organization };
    });

    return successResponse(
      {
        user: result.user,
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
        },
      },
      {
        status: 201,
        message: 'Account created successfully',
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        new ValidationError('Validation failed', error.errors),
        422
      );
    }

    return errorResponse(error as Error);
  }
}
