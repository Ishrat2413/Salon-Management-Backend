/*
  Warnings:

  - A unique constraint covering the columns `[managerId]` on the table `salons` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "salons" ADD COLUMN     "managerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "salons_managerId_key" ON "salons"("managerId");

-- AddForeignKey
ALTER TABLE "salons" ADD CONSTRAINT "salons_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
