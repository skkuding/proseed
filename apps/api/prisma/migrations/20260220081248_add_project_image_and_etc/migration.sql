/*
  Warnings:

  - You are about to drop the column `phone_number` on the `user` table. All the data in the column will be lost.
  - Added the required column `type` to the `project` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `project` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `jobType` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('Planner', 'Designer', 'Developer', 'Other');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('APP', 'WEB');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Available', 'MVP', 'Ongoing', 'Hiring');

-- AlterTable
ALTER TABLE "project" ADD COLUMN     "icon_url" TEXT,
ADD COLUMN     "type" "ProjectType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ProjectStatus" NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "phone_number",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "birth" TEXT,
ADD COLUMN     "jobType" "JobType" NOT NULL,
ADD COLUMN     "profileImageUrl" TEXT;

-- CreateTable
CREATE TABLE "project_image" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_image" ADD CONSTRAINT "project_image_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
