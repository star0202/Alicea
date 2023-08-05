-- CreateTable
CREATE TABLE "Welcome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user" TEXT NOT NULL,
    "bot" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Welcome_id_key" ON "Welcome"("id");
