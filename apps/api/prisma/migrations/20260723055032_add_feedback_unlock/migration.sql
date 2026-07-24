-- CreateTable
CREATE TABLE "feedback_unlock" (
    "id" SERIAL NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "unlocked_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_unlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feedback_unlock_unlocked_by_id_idx" ON "feedback_unlock"("unlocked_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_unlock_submission_id_key" ON "feedback_unlock"("submission_id");

-- AddForeignKey
ALTER TABLE "feedback_unlock" ADD CONSTRAINT "feedback_unlock_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "feedback_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_unlock" ADD CONSTRAINT "feedback_unlock_unlocked_by_id_fkey" FOREIGN KEY ("unlocked_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
