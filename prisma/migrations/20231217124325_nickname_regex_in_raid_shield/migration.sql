/*
  Warnings:

  - Added the required column `regex` to the `RaidShield` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RaidShield" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "regex" TEXT NOT NULL
);
INSERT INTO "new_RaidShield" ("id", "role") SELECT "id", "role" FROM "RaidShield";
DROP TABLE "RaidShield";
ALTER TABLE "new_RaidShield" RENAME TO "RaidShield";
CREATE UNIQUE INDEX "RaidShield_id_key" ON "RaidShield"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
