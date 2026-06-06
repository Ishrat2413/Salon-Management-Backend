-- AlterTable
ALTER TABLE "salon_entries" ADD COLUMN     "lengthId" TEXT,
ADD COLUMN     "sizeId" TEXT;

-- CreateTable
CREATE TABLE "sizes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lengths" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "lengths_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "salon_entries" ADD CONSTRAINT "salon_entries_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salon_entries" ADD CONSTRAINT "salon_entries_lengthId_fkey" FOREIGN KEY ("lengthId") REFERENCES "lengths"("id") ON DELETE SET NULL ON UPDATE CASCADE;
