-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- Step 1: Add new role column with enum type
ALTER TABLE "users" ADD COLUMN "role_new" "UserRole";

-- Step 2: Migrate existing role data
-- Convert 'admin' and 'manager' to 'ADMIN', 'member' to 'USER'
UPDATE "users"
SET "role_new" = CASE
  WHEN "role" IN ('admin', 'manager') THEN 'ADMIN'::"UserRole"
  WHEN "role" = 'member' THEN 'USER'::"UserRole"
  ELSE 'USER'::"UserRole"  -- Default fallback
END;

-- Step 3: Drop old role column and rename new one
ALTER TABLE "users" DROP COLUMN "role";
ALTER TABLE "users" RENAME COLUMN "role_new" TO "role";

-- Step 4: Set default value for role
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER'::"UserRole";
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;

-- Add dynamic fields to ad_templates table
ALTER TABLE "ad_templates" ADD COLUMN "dynamicFields" JSONB;
ALTER TABLE "ad_templates" ADD COLUMN "fieldSchema" JSONB;
ALTER TABLE "ad_templates" ADD COLUMN "isGlobal" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ad_templates" ADD COLUMN "requiresApproval" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "template_launches" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "adAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fieldValues" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_launches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ad_templates_isGlobal_idx" ON "ad_templates"("isGlobal");

-- CreateIndex
CREATE INDEX "template_launches_templateId_idx" ON "template_launches"("templateId");

-- CreateIndex
CREATE INDEX "template_launches_campaignId_idx" ON "template_launches"("campaignId");

-- CreateIndex
CREATE INDEX "template_launches_userId_idx" ON "template_launches"("userId");

-- AddForeignKey
ALTER TABLE "template_launches" ADD CONSTRAINT "template_launches_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ad_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_launches" ADD CONSTRAINT "template_launches_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
