-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CleanChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guild" TEXT NOT NULL,
    "cleanAllowed" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_CleanChannel" ("guild", "id") SELECT "guild", "id" FROM "CleanChannel";
DROP TABLE "CleanChannel";
ALTER TABLE "new_CleanChannel" RENAME TO "CleanChannel";
CREATE UNIQUE INDEX "CleanChannel_id_key" ON "CleanChannel"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
