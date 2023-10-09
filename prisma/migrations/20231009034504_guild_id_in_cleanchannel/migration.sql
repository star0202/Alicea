/*
  Warnings:

  - Added the required column `guild` to the `CleanChannel` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CleanChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guild" TEXT NOT NULL
);
INSERT INTO "new_CleanChannel" ("id") SELECT "id" FROM "CleanChannel";
DROP TABLE "CleanChannel";
ALTER TABLE "new_CleanChannel" RENAME TO "CleanChannel";
CREATE UNIQUE INDEX "CleanChannel_id_key" ON "CleanChannel"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
