/*
  Warnings:

  - Changed the type of `role` on the `project_role` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "project_role" DROP COLUMN "role",
ADD COLUMN     "role" "JobType" NOT NULL;

-- DropEnum
DROP TYPE "ProjectRoleType";
