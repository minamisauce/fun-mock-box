-- CreateTable
CREATE TABLE "entry_sheets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "original_content" TEXT,
    "ai_explanation_schema_version" TEXT NOT NULL,
    "ai_explanation_json" JSONB NOT NULL,
    "inflow_source" TEXT,
    CONSTRAINT "entry_sheets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "motivations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "inflow_source" TEXT,
    CONSTRAINT "motivations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "self_promotions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "inflow_source" TEXT,
    CONSTRAINT "self_promotions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anonymous_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "entry_sheets_user_id_created_at_idx" ON "entry_sheets"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "motivations_user_id_created_at_idx" ON "motivations"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "self_promotions_user_id_created_at_idx" ON "self_promotions"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_anonymous_id_key" ON "users"("anonymous_id");
