/**
 * Extended NextAuth TypeScript type definitions
 * Augments NextAuth session and user types with custom fields
 */

import { UserRole } from '@prisma/client';
import 'next-auth';
import 'next-auth/jwt';

/**
 * Extend NextAuth Session interface
 * Adds custom fields to session.user
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
      organizationId: string;
      image?: string | null;
    };
  }

  /**
   * Extend NextAuth User interface
   * Used during sign-in and token creation
   */
  interface User {
    id?: string;
    email?: string | null;
    name?: string | null;
    role: UserRole;
    organizationId: string;
    image?: string | null;
  }
}

/**
 * Extend NextAuth JWT interface
 * Adds custom fields to JWT token
 */
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    organizationId: string;
  }
}

/**
 * Extended session user type
 * Provides type-safe access to session user properties
 */
export interface ExtendedSessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  organizationId: string;
  image?: string | null;
}

/**
 * Type guard to check if session user is admin
 */
export function isSessionAdmin(user: ExtendedSessionUser): boolean {
  return user.role === UserRole.ADMIN;
}

/**
 * Type guard to check if session user is regular user
 */
export function isSessionUser(user: ExtendedSessionUser): boolean {
  return user.role === UserRole.USER;
}
