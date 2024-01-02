/*
  Warnings:

  - Made the column `months` on table `Raid` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Raid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "months" INTEGER NOT NULL,
    "role" TEXT NOT NULL
);
INSERT INTO "new_Raid" ("id", "months", "role") SELECT "id", "months", "role" FROM "Raid";
DROP TABLE "Raid";
ALTER TABLE "new_Raid" RENAME TO "Raid";
CREATE UNIQUE INDEX "Raid_id_key" ON "Raid"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
