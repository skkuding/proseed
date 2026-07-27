-- 기존 unlock은 제출 전체를 한 번에 여는 모델이라 직군 정보가 없음.
-- 로컬 개발 데이터뿐이고 새 모델(제출×직군 단위)로는 의미가 매핑되지 않아 초기화한다.
TRUNCATE TABLE "feedback_unlock";

-- DropIndex
DROP INDEX "feedback_unlock_submission_id_key";

-- AlterTable
ALTER TABLE "feedback_unlock" ADD COLUMN "category" "RecordCategory" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "feedback_unlock_submission_id_category_key" ON "feedback_unlock"("submission_id", "category");
