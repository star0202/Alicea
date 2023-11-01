/*
  Warnings:

  - Added the required column `reason` to the `Censor` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Censor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regex" TEXT NOT NULL,
    "reason" TEXT NOT NULL
);
INSERT INTO "new_Censor" ("id", "regex") SELECT "id", "regex" FROM "Censor";
DROP TABLE "Censor";
ALTER TABLE "new_Censor" RENAME TO "Censor";
CREATE UNIQUE INDEX "Censor_id_key" ON "Censor"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
