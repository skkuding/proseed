/*
  Warnings:

  - You are about to drop the column `project_id` on the `growth_record` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `growth_record` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[version_id,category]` on the table `growth_record` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `version_id` to the `growth_record` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "growth_record" DROP CONSTRAINT "growth_record_project_id_fkey";

-- AlterTable
ALTER TABLE "growth_record" DROP COLUMN "project_id",
DROP COLUMN "version",
ADD COLUMN     "version_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "project_version" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "release_note" TEXT,
    "released_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_version_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_version_project_id_version_key" ON "project_version"("project_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "growth_record_version_id_category_key" ON "growth_record"("version_id", "category");

-- AddForeignKey
ALTER TABLE "project_version" ADD CONSTRAINT "project_version_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "growth_record" ADD CONSTRAINT "growth_record_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "project_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
