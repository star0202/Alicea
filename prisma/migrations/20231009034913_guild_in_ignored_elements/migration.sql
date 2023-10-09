/*
  Warnings:

  - Added the required column `guild` to the `IgnoredChannel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guild` to the `IgnoredUser` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IgnoredChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guild" TEXT NOT NULL
);
INSERT INTO "new_IgnoredChannel" ("id") SELECT "id" FROM "IgnoredChannel";
DROP TABLE "IgnoredChannel";
ALTER TABLE "new_IgnoredChannel" RENAME TO "IgnoredChannel";
CREATE UNIQUE INDEX "IgnoredChannel_id_key" ON "IgnoredChannel"("id");
CREATE TABLE "new_IgnoredUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guild" TEXT NOT NULL
);
INSERT INTO "new_IgnoredUser" ("id") SELECT "id" FROM "IgnoredUser";
DROP TABLE "IgnoredUser";
ALTER TABLE "new_IgnoredUser" RENAME TO "IgnoredUser";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
