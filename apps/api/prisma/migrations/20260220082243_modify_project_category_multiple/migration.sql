/*
  Warnings:

  - Changed the column `category` on the `project` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterTable
ALTER TABLE "project" ALTER COLUMN "category" SET DATA TYPE "ProjectCategory"[] USING ARRAY["category"]::"ProjectCategory"[];
