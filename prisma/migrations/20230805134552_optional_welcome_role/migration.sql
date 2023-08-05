-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Welcome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user" TEXT,
    "bot" TEXT
);
INSERT INTO "new_Welcome" ("bot", "id", "user") SELECT "bot", "id", "user" FROM "Welcome";
DROP TABLE "Welcome";
ALTER TABLE "new_Welcome" RENAME TO "Welcome";
CREATE UNIQUE INDEX "Welcome_id_key" ON "Welcome"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
