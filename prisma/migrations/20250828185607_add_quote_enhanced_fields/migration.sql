-- AlterTable
ALTER TABLE "quote_items" ADD COLUMN "exposedArea" TEXT;
ALTER TABLE "quote_items" ADD COLUMN "materials" TEXT;

-- AlterTable
ALTER TABLE "quotes" ADD COLUMN "diagnosis" TEXT;
ALTER TABLE "quotes" ADD COLUMN "serviceType" TEXT;
ALTER TABLE "quotes" ADD COLUMN "technician" TEXT;
