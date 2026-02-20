-- CreateTable
CREATE TABLE "growth_record_image" (
    "id" SERIAL NOT NULL,
    "growth_record_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "growth_record_image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "growth_record_image" ADD CONSTRAINT "growth_record_image_growth_record_id_fkey" FOREIGN KEY ("growth_record_id") REFERENCES "growth_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;
