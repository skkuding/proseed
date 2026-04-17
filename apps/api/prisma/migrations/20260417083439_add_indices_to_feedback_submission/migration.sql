-- 1. 새로운 테이블들 생성
CREATE TABLE "session" (
    "id" SERIAL NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "feedback_submission" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "version_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "oneline_review" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feedback_submission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "feedback_image" (
    "id" SERIAL NOT NULL,
    "feedback_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feedback_image_pkey" PRIMARY KEY ("id")
);

-- 2. User 테이블 컬럼 변경
ALTER TABLE "user" DROP COLUMN IF EXISTS "jobType";
ALTER TABLE "user" DROP COLUMN IF EXISTS "profileImageUrl";
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "job_type" "JobType";
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "profile_image_url" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 3. Feedback 테이블에 새로운 컬럼 일단 Null 허용으로 추가
ALTER TABLE "feedback" ADD COLUMN "submission_id" INTEGER;
ALTER TABLE "feedback" ADD COLUMN "adopted_category" "RecordCategory";
ALTER TABLE "feedback" ADD COLUMN "is_adopted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "feedback" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 4. 데이터 이관 (기존 Feedback 데이터를 Submission으로 옮기기)
INSERT INTO "feedback_submission" ("project_id", "version_id", "user_id", "oneline_review", "updated_at")
SELECT DISTINCT pv."project_id", f."version_id", f."user_id", '', NOW()
FROM "feedback" f
JOIN "project_version" pv ON f."version_id" = pv."id"
WHERE f."version_id" IS NOT NULL AND f."user_id" IS NOT NULL;

UPDATE "feedback" f
SET "submission_id" = fs."id"
FROM "feedback_submission" fs
WHERE f."version_id" = fs."version_id" AND f."user_id" = fs."user_id";

-- 5. 제약 조건 강화 및 이전 컬럼 삭제
ALTER TABLE "feedback" DROP CONSTRAINT IF EXISTS "feedback_user_id_fkey";
ALTER TABLE "feedback" DROP CONSTRAINT IF EXISTS "feedback_version_id_fkey";
ALTER TABLE "feedback" DROP COLUMN "user_id";
ALTER TABLE "feedback" DROP COLUMN "version_id";

-- 데이터 정합성이 확보된 경우 submission_id를 NOT NULL로 변경
ALTER TABLE "feedback" ALTER COLUMN "submission_id" SET NOT NULL;

-- 6. 인덱스 및 외래 키 설정
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
CREATE INDEX "feedback_submission_project_id_idx" ON "feedback_submission"("project_id");
CREATE INDEX "feedback_submission_version_id_user_id_idx" ON "feedback_submission"("version_id", "user_id");

ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feedback_submission" ADD CONSTRAINT "feedback_submission_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feedback_submission" ADD CONSTRAINT "feedback_submission_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "project_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feedback_submission" ADD CONSTRAINT "feedback_submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "feedback_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feedback_image" ADD CONSTRAINT "feedback_image_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. 이전 테이블 및 타입 삭제
DROP TABLE IF EXISTS "user_oauth";
DROP TYPE IF EXISTS "Provider";
