-- AlterTable
ALTER TABLE "feedback" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "feedback_submission" ALTER COLUMN "oneline_review" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "updated_at" DROP DEFAULT;
