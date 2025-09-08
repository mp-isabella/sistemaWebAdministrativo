-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_quotes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteNumber" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" DATETIME NOT NULL,
    "subtotal" REAL NOT NULL,
    "tax" REAL NOT NULL,
    "total" REAL NOT NULL,
    "taxRate" REAL NOT NULL DEFAULT 19,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "technician" TEXT,
    "diagnosis" TEXT,
    "serviceType" TEXT,
    "clientName" TEXT,
    "clientAddress" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "clientRegion" TEXT,
    "clientCommune" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clientId" TEXT,
    "companyId" TEXT,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "quotes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "quotes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "quotes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_quotes" ("clientId", "companyId", "createdAt", "createdById", "date", "diagnosis", "id", "notes", "quoteNumber", "serviceType", "status", "subtotal", "tax", "taxRate", "technician", "total", "updatedAt", "validUntil") SELECT "clientId", "companyId", "createdAt", "createdById", "date", "diagnosis", "id", "notes", "quoteNumber", "serviceType", "status", "subtotal", "tax", "taxRate", "technician", "total", "updatedAt", "validUntil" FROM "quotes";
DROP TABLE "quotes";
ALTER TABLE "new_quotes" RENAME TO "quotes";
CREATE UNIQUE INDEX "quotes_quoteNumber_key" ON "quotes"("quoteNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
