/*
  Warnings:

  - You are about to drop the column `category` on the `feedback_submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "feedback" ADD COLUMN     "category" "RecordCategory";

-- AlterTable
ALTER TABLE "feedback_submission" DROP COLUMN "category";
