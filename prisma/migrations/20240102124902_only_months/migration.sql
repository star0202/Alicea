/*
  Warnings:

  - You are about to drop the column `days` on the `Raid` table. All the data in the column will be lost.
  - You are about to drop the column `years` on the `Raid` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Raid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "months" INTEGER,
    "role" TEXT NOT NULL
);
INSERT INTO "new_Raid" ("id", "months", "role") SELECT "id", "months", "role" FROM "Raid";
DROP TABLE "Raid";
ALTER TABLE "new_Raid" RENAME TO "Raid";
CREATE UNIQUE INDEX "Raid_id_key" ON "Raid"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
