-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CleanChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cleanId" TEXT,
    CONSTRAINT "CleanChannel_cleanId_fkey" FOREIGN KEY ("cleanId") REFERENCES "Clean" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CleanChannel" ("cleanId", "id") SELECT "cleanId", "id" FROM "CleanChannel";
DROP TABLE "CleanChannel";
ALTER TABLE "new_CleanChannel" RENAME TO "CleanChannel";
CREATE UNIQUE INDEX "CleanChannel_id_key" ON "CleanChannel"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
