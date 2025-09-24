/*
  Warnings:

  - Added the required column `baseSalary` to the `Liquidation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `liquidationNumber` to the `Liquidation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netSalary` to the `Liquidation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAdvances` to the `Liquidation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDeductions` to the `Liquidation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalEarnings` to the `Liquidation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN "images" TEXT;
ALTER TABLE "Job" ADD COLUMN "observations" TEXT;
ALTER TABLE "Job" ADD COLUMN "signature" TEXT;

-- AlterTable
ALTER TABLE "LiquidationItem" ADD COLUMN "notes" TEXT;
ALTER TABLE "LiquidationItem" ADD COLUMN "quantity" REAL;
ALTER TABLE "LiquidationItem" ADD COLUMN "unitPrice" REAL;

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GENERATING',
    "filePath" TEXT,
    "fileSize" INTEGER,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "data" TEXT,
    "summary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Report_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT,
    "category" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reportId" TEXT NOT NULL,
    CONSTRAINT "ReportMetric_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Liquidation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "liquidationNumber" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "baseSalary" REAL NOT NULL,
    "totalEarnings" REAL NOT NULL,
    "totalDeductions" REAL NOT NULL,
    "totalAdvances" REAL NOT NULL,
    "netSalary" REAL NOT NULL,
    "taxRate" REAL NOT NULL DEFAULT 19,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "technicianId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Liquidation_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Liquidation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Liquidation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Liquidation" ("companyId", "createdAt", "createdById", "id", "notes", "periodEnd", "periodStart", "technicianId", "updatedAt") SELECT "companyId", "createdAt", "createdById", "id", "notes", "periodEnd", "periodStart", "technicianId", "updatedAt" FROM "Liquidation";
DROP TABLE "Liquidation";
ALTER TABLE "new_Liquidation" RENAME TO "Liquidation";
CREATE UNIQUE INDEX "Liquidation_liquidationNumber_key" ON "Liquidation"("liquidationNumber");
CREATE TABLE "new_LiquidationAdvance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "liquidationId" TEXT NOT NULL,
    CONSTRAINT "LiquidationAdvance_liquidationId_fkey" FOREIGN KEY ("liquidationId") REFERENCES "Liquidation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LiquidationAdvance" ("amount", "createdAt", "date", "description", "id", "liquidationId", "updatedAt") SELECT "amount", "createdAt", "date", "description", "id", "liquidationId", "updatedAt" FROM "LiquidationAdvance";
DROP TABLE "LiquidationAdvance";
ALTER TABLE "new_LiquidationAdvance" RENAME TO "LiquidationAdvance";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
