-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "prdText" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "docTypes" TEXT NOT NULL,
    "docsJson" TEXT NOT NULL,
    "testCasesJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Session" ("createdAt", "docTypes", "docsJson", "id", "prdText", "sourceType", "summary", "title", "updatedAt") SELECT "createdAt", "docTypes", "docsJson", "id", "prdText", "sourceType", "summary", "title", "updatedAt" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
