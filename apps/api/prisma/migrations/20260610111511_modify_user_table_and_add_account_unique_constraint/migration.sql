/*
  Warnings:

  - You are about to drop the column `birth` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `owned_ticket_count` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account_id,provider_id]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - Made the column `profile_image_url` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "birth",
DROP COLUMN "owned_ticket_count",
ADD COLUMN     "links" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "ticket_balance" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "profile_image_url" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "account_account_id_provider_id_key" ON "account"("account_id", "provider_id");
