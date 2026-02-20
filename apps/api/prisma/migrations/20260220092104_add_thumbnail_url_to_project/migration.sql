/*
  Warnings:

  - Added the required column `thumbnail_url` to the `project` table without a default value. This is not possible if the table is not empty.
  - Made the column `icon_url` on table `project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "project" ADD COLUMN     "thumbnail_url" TEXT NOT NULL,
ALTER COLUMN "icon_url" SET NOT NULL;

-- AlterTable
ALTER TABLE "project_role" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
