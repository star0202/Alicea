/*
  Warnings:

  - You are about to drop the `RaidShield` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RaidShield";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Raid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "regex" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Raid_id_key" ON "Raid"("id");
