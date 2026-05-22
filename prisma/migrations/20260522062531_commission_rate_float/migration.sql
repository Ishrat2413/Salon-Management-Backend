-- AlterTable
ALTER TABLE "salon_entries" ADD COLUMN     "commissionEarnings" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "commissionRate" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "split_entries" ADD COLUMN     "commissionEarnings" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "commissionRate" INTEGER DEFAULT 0;
