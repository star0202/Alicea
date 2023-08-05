-- CreateTable
CREATE TABLE "Clean" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "CleanChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cleanId" TEXT,
    CONSTRAINT "CleanChannel_cleanId_fkey" FOREIGN KEY ("cleanId") REFERENCES "Clean" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Clean_id_key" ON "Clean"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CleanChannel_id_key" ON "CleanChannel"("id");
