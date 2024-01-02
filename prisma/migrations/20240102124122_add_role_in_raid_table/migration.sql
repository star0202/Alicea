/*
  Warnings:

  - Added the required column `role` to the `Raid` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Raid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" INTEGER,
    "month" INTEGER,
    "year" INTEGER,
    "role" TEXT NOT NULL
);
INSERT INTO "new_Raid" ("day", "id", "month", "year") SELECT "day", "id", "month", "year" FROM "Raid";
DROP TABLE "Raid";
ALTER TABLE "new_Raid" RENAME TO "Raid";
CREATE UNIQUE INDEX "Raid_id_key" ON "Raid"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
