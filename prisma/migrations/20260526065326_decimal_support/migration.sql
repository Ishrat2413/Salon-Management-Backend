-- Restore missing applied migration for decimal-support columns.
-- This matches the already-applied DB changes so migration history stays consistent.

ALTER TABLE "commission_rates"
ALTER COLUMN "rate" TYPE DOUBLE PRECISION;

ALTER TABLE "salon_entries"
ALTER COLUMN "totalPrice" TYPE DOUBLE PRECISION,
ALTER COLUMN "actualPrice" TYPE DOUBLE PRECISION,
ALTER COLUMN "tips" TYPE DOUBLE PRECISION,
ALTER COLUMN "addHair" TYPE DOUBLE PRECISION,
ALTER COLUMN "commissionRate" TYPE DOUBLE PRECISION;

ALTER TABLE "salon_entries"
ALTER COLUMN "actualPrice" SET DEFAULT 0,
ALTER COLUMN "tips" SET DEFAULT 0,
ALTER COLUMN "addHair" SET DEFAULT 0,
ALTER COLUMN "commissionRate" SET DEFAULT 0;

ALTER TABLE "split_entries"
ALTER COLUMN "totalPrice" TYPE DOUBLE PRECISION,
ALTER COLUMN "tips" TYPE DOUBLE PRECISION,
ALTER COLUMN "commissionRate" TYPE DOUBLE PRECISION;

ALTER TABLE "split_entries"
ALTER COLUMN "tips" SET DEFAULT 0,
ALTER COLUMN "commissionRate" SET DEFAULT 0;
