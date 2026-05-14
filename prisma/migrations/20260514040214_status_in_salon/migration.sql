-- CreateEnum
CREATE TYPE "SalonEntryStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "salon_entries" ADD COLUMN     "status" "SalonEntryStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "statusComment" TEXT;
