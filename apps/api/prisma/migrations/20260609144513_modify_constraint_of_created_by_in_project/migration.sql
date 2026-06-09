-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_createdById_fkey";

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
