-- Role Conversion Verification Script
-- Use this to verify role migration before and after running the main migration

-- ============================================
-- PRE-MIGRATION VERIFICATION
-- ============================================
-- Run this query BEFORE migration to see current role distribution
SELECT
  role,
  COUNT(*) as user_count,
  CASE
    WHEN role IN ('admin', 'manager') THEN 'Will become ADMIN'
    WHEN role = 'member' THEN 'Will become USER'
    ELSE 'Unknown role - will default to USER'
  END as new_role
FROM users
GROUP BY role
ORDER BY user_count DESC;

-- ============================================
-- POST-MIGRATION VERIFICATION
-- ============================================
-- Run this query AFTER migration to verify role conversion
SELECT
  role,
  COUNT(*) as user_count
FROM users
GROUP BY role
ORDER BY user_count DESC;

-- Expected results after migration:
-- role  | user_count
-- ------|-----------
-- USER  | [count of former 'member' users]
-- ADMIN | [count of former 'admin' + 'manager' users]

-- ============================================
-- ROLLBACK REFERENCE (if needed)
-- ============================================
-- If you need to rollback, here's the reverse migration:
/*
-- Drop the TemplateLaunch table
DROP TABLE IF EXISTS "template_launches";

-- Remove dynamic fields from ad_templates
ALTER TABLE "ad_templates" DROP COLUMN IF EXISTS "dynamicFields";
ALTER TABLE "ad_templates" DROP COLUMN IF EXISTS "fieldSchema";
ALTER TABLE "ad_templates" DROP COLUMN IF EXISTS "isGlobal";
ALTER TABLE "ad_templates" DROP COLUMN IF EXISTS "requiresApproval";

-- Revert role enum to string
ALTER TABLE "users" ADD COLUMN "role_string" TEXT;

UPDATE "users"
SET "role_string" = CASE
  WHEN "role" = 'ADMIN' THEN 'admin'
  WHEN "role" = 'USER' THEN 'member'
END;

ALTER TABLE "users" DROP COLUMN "role";
ALTER TABLE "users" RENAME COLUMN "role_string" TO "role";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'member';

DROP TYPE IF EXISTS "UserRole";
*/
