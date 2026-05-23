/*
  Warnings:

  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "salon_entries" ADD COLUMN     "editedById" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "bio";

-- AddForeignKey
ALTER TABLE "salon_entries" ADD CONSTRAINT "salon_entries_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
