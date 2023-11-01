-- CreateTable
CREATE TABLE "Censor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regex" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Censor_id_key" ON "Censor"("id");
