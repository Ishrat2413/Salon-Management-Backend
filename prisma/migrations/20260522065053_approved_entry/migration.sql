-- AlterTable
ALTER TABLE "salon_entries" ADD COLUMN     "approvedById" TEXT;

-- AddForeignKey
ALTER TABLE "salon_entries" ADD CONSTRAINT "salon_entries_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
