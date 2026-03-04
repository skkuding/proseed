/*
  Warnings:

  - The values [ADMIN,MEMBER] on the enum `ProjectRoleType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectRoleType_new" AS ENUM ('PLAN', 'DESIGN', 'FRONTEND', 'BACKEND', 'OTHER');
ALTER TABLE "public"."project_role" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "project_role" ALTER COLUMN "role" TYPE "ProjectRoleType_new" USING ("role"::text::"ProjectRoleType_new");
ALTER TYPE "ProjectRoleType" RENAME TO "ProjectRoleType_old";
ALTER TYPE "ProjectRoleType_new" RENAME TO "ProjectRoleType";
DROP TYPE "public"."ProjectRoleType_old";
COMMIT;

-- AlterTable
ALTER TABLE "project_role" ADD COLUMN     "isLeader" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "role" DROP DEFAULT;
