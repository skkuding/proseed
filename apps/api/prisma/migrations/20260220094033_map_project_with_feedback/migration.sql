-- AlterTable
ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
