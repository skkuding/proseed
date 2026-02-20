/*
  Warnings:

  - You are about to drop the column `update_goal` on the `growth_record` table. All the data in the column will be lost.
  - You are about to drop the column `update_results` on the `growth_record` table. All the data in the column will be lost.
  - You are about to drop the column `release_note` on the `project_version` table. All the data in the column will be lost.
  - Changed the type of `category` on the `feedback_question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `category` on the `growth_record` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `update_goal` to the `project_version` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RecordCategory" AS ENUM ('PLAN', 'DESIGN', 'DEVELOPMENT', 'GENERAL');

-- AlterTable
ALTER TABLE "feedback_question" DROP COLUMN "category",
ADD COLUMN     "category" "RecordCategory" NOT NULL;

-- AlterTable
ALTER TABLE "growth_record" DROP COLUMN "update_goal",
DROP COLUMN "update_results",
DROP COLUMN "category",
ADD COLUMN     "category" "RecordCategory" NOT NULL;

-- AlterTable
ALTER TABLE "project_version" DROP COLUMN "release_note",
ADD COLUMN     "update_goal" TEXT NOT NULL,
ADD COLUMN     "update_results" TEXT[];

-- DropEnum
DROP TYPE "FeedbackQuestionCategory";

-- DropEnum
DROP TYPE "GrowthRecordCategory";

-- CreateIndex
CREATE UNIQUE INDEX "growth_record_version_id_category_key" ON "growth_record"("version_id", "category");
