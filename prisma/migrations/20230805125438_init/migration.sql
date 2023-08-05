-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channel" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "IgnoredChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logId" TEXT,
    CONSTRAINT "IgnoredChannel_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IgnoredUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logId" TEXT,
    CONSTRAINT "IgnoredUser_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Log_id_key" ON "Log"("id");
