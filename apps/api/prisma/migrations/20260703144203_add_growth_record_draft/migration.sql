-- CreateTable
CREATE TABLE "growth_record_draft" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "category" "RecordCategory" NOT NULL,
    "content" JSONB NOT NULL,
    "updated_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "growth_record_draft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "growth_record_draft_project_id_category_key" ON "growth_record_draft"("project_id", "category");

-- AddForeignKey
ALTER TABLE "growth_record_draft" ADD CONSTRAINT "growth_record_draft_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "growth_record_draft" ADD CONSTRAINT "growth_record_draft_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
