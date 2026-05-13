-- CreateTable
CREATE TABLE "salon_entries" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "tips" INTEGER DEFAULT 0,
    "addHair" INTEGER DEFAULT 0,
    "notes" TEXT,
    "isSplit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salon_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_entries" (
    "id" TEXT NOT NULL,
    "salonEntryId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "tips" INTEGER DEFAULT 0,

    CONSTRAINT "split_entries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "salon_entries" ADD CONSTRAINT "salon_entries_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salon_entries" ADD CONSTRAINT "salon_entries_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salon_entries" ADD CONSTRAINT "salon_entries_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_entries" ADD CONSTRAINT "split_entries_salonEntryId_fkey" FOREIGN KEY ("salonEntryId") REFERENCES "salon_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_entries" ADD CONSTRAINT "split_entries_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
