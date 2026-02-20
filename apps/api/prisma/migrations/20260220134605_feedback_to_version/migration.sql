/*
  Warnings:

  - You are about to drop the column `project_id` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `feedback_question` table. All the data in the column will be lost.
  - Added the required column `version_id` to the `feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version_id` to the `feedback_question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_project_id_fkey";

-- DropForeignKey
ALTER TABLE "feedback_question" DROP CONSTRAINT "feedback_question_project_id_fkey";

-- AlterTable
ALTER TABLE "feedback" DROP COLUMN "project_id",
ADD COLUMN     "version_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "feedback_question" DROP COLUMN "project_id",
ADD COLUMN     "version_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "feedback_question" ADD CONSTRAINT "feedback_question_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "project_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "project_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
