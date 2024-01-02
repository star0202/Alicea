-- CreateTable
CREATE TABLE "Raid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" INTEGER,
    "month" INTEGER,
    "year" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "Raid_id_key" ON "Raid"("id");
