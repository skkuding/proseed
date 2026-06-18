/*
  Warnings:

  - You are about to drop the column `isLeader` on the `project_role` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Sprout', 'Seeder');

-- CreateEnum
CREATE TYPE "ProjectMemberRole" AS ENUM ('Lead', 'TeamLeader', 'TeamMember');

-- AlterTable
ALTER TABLE "project_role" DROP COLUMN "isLeader",
ADD COLUMN     "project_member_role" "ProjectMemberRole" NOT NULL DEFAULT 'TeamMember';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "user_role" "UserRole" NOT NULL DEFAULT 'Sprout';
