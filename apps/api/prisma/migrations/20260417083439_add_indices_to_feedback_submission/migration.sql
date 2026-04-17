/*
  Warnings:

  - You are about to drop the column `user_id` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `version_id` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `jobType` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `profileImageUrl` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `user_oauth` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `submission_id` to the `feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_user_id_fkey";

-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_version_id_fkey";

-- DropForeignKey
ALTER TABLE "user_oauth" DROP CONSTRAINT "user_oauth_user_id_fkey";

-- AlterTable
ALTER TABLE "feedback" DROP COLUMN "user_id",
DROP COLUMN "version_id",
ADD COLUMN     "adopted_category" "RecordCategory",
ADD COLUMN     "is_adopted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "submission_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "jobType",
DROP COLUMN "profileImageUrl",
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "job_type" "JobType",
ADD COLUMN     "profile_image_url" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "user_oauth";

-- DropEnum
DROP TYPE "Provider";

-- CreateTable
CREATE TABLE "session" (
    "id" SERIAL NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_submission" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "version_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "oneline_review" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_image" (
    "id" SERIAL NOT NULL,
    "feedback_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "feedback_submission_project_id_idx" ON "feedback_submission"("project_id");

-- CreateIndex
CREATE INDEX "feedback_submission_version_id_user_id_idx" ON "feedback_submission"("version_id", "user_id");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_submission" ADD CONSTRAINT "feedback_submission_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_submission" ADD CONSTRAINT "feedback_submission_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "project_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_submission" ADD CONSTRAINT "feedback_submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "feedback_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_image" ADD CONSTRAINT "feedback_image_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;
