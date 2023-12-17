-- CreateTable
CREATE TABLE "RaidShield" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RaidShield_id_key" ON "RaidShield"("id");
