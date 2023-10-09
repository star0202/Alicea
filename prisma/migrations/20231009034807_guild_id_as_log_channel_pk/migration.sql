/*
  Warnings:

  - Added the required column `channel` to the `LogChannel` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LogChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channel" TEXT NOT NULL
);
INSERT INTO "new_LogChannel" ("id") SELECT "id" FROM "LogChannel";
DROP TABLE "LogChannel";
ALTER TABLE "new_LogChannel" RENAME TO "LogChannel";
CREATE UNIQUE INDEX "LogChannel_id_key" ON "LogChannel"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
