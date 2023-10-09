/*
  Warnings:

  - You are about to drop the `Clean` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `logId` on the `IgnoredChannel` table. All the data in the column will be lost.
  - You are about to drop the column `logId` on the `IgnoredUser` table. All the data in the column will be lost.
  - You are about to drop the column `cleanId` on the `CleanChannel` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Clean_id_key";

-- DropIndex
DROP INDEX "Log_id_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Clean";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Log";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "LogChannel" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IgnoredChannel" (
    "id" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_IgnoredChannel" ("id") SELECT "id" FROM "IgnoredChannel";
DROP TABLE "IgnoredChannel";
ALTER TABLE "new_IgnoredChannel" RENAME TO "IgnoredChannel";
CREATE UNIQUE INDEX "IgnoredChannel_id_key" ON "IgnoredChannel"("id");
CREATE TABLE "new_IgnoredUser" (
    "id" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_IgnoredUser" ("id") SELECT "id" FROM "IgnoredUser";
DROP TABLE "IgnoredUser";
ALTER TABLE "new_IgnoredUser" RENAME TO "IgnoredUser";
CREATE TABLE "new_CleanChannel" (
    "id" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_CleanChannel" ("id") SELECT "id" FROM "CleanChannel";
DROP TABLE "CleanChannel";
ALTER TABLE "new_CleanChannel" RENAME TO "CleanChannel";
CREATE UNIQUE INDEX "CleanChannel_id_key" ON "CleanChannel"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "LogChannel_id_key" ON "LogChannel"("id");
