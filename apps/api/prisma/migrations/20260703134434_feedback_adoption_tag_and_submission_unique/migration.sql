/*
  Warnings:

  - You are about to drop the column `adopted_category` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `is_adopted` on the `feedback` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[version_id,user_id]` on the table `feedback_submission` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "feedback_submission_version_id_user_id_idx";

-- AlterTable
ALTER TABLE "feedback" DROP COLUMN "adopted_category",
DROP COLUMN "is_adopted";

-- CreateTable
CREATE TABLE "feedback_adoption" (
    "id" SERIAL NOT NULL,
    "growth_record_id" INTEGER NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_adoption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feedback_adoption_submission_id_idx" ON "feedback_adoption"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_adoption_growth_record_id_submission_id_key" ON "feedback_adoption"("growth_record_id", "submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_submission_version_id_user_id_key" ON "feedback_submission"("version_id", "user_id");

-- AddForeignKey
ALTER TABLE "feedback_adoption" ADD CONSTRAINT "feedback_adoption_growth_record_id_fkey" FOREIGN KEY ("growth_record_id") REFERENCES "growth_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_adoption" ADD CONSTRAINT "feedback_adoption_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "feedback_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
