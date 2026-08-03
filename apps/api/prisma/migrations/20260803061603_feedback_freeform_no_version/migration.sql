-- AlterTable
ALTER TABLE "feedback" ALTER COLUMN "question_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "feedback_submission" ADD COLUMN     "category" "RecordCategory",
ALTER COLUMN "version_id" DROP NOT NULL;
