-- CreateEnum
CREATE TYPE "GrowthRecordCategory" AS ENUM ('DEVELOPMENT', 'DESIGN', 'PLAN', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectRoleType" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('KAKAO', 'NAVER', 'GOOGLE');

-- CreateEnum
CREATE TYPE "FeedbackQuestionCategory" AS ENUM ('USABILITY', 'DESIGN', 'FUNCTION', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('HEALTHCARE', 'FINANCE', 'PUBLIC', 'COMMERCE', 'EDUCATION', 'ENTERTAINMENT', 'MOBILITY', 'ENERGY', 'REALESTATE', 'LIFESTYLE', 'PRODUCTIVITY', 'COMMUNITY', 'AI');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownedTicketCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_oauth" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" "Provider" NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_oauth_pkey" PRIMARY KEY ("id","provider")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "oneLineDescription" TEXT,
    "description" TEXT,
    "category" "ProjectCategory",
    "status" TEXT,
    "contactPath" TEXT,
    "projectLink" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthRecord" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "version" TEXT,
    "category" "GrowthRecordCategory",
    "updateGoal" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updateResults" TEXT[],

    CONSTRAINT "GrowthRecord_pkey" PRIMARY KEY ("id","projectId")
);

-- CreateTable
CREATE TABLE "ProjectRole" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "role" "ProjectRoleType",

    CONSTRAINT "ProjectRole_pkey" PRIMARY KEY ("id","userId","projectId")
);

-- CreateTable
CREATE TABLE "FeedbackQuestion" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "category" "FeedbackQuestionCategory",
    "title" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER DEFAULT 0,
    "isRequired" BOOLEAN DEFAULT false,

    CONSTRAINT "FeedbackQuestion_pkey" PRIMARY KEY ("id","projectId")
);

-- CreateTable
CREATE TABLE "GrowthRecordContent" (
    "id" SERIAL NOT NULL,
    "growthRecordId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "isDefaultQuestion" BOOLEAN DEFAULT false,

    CONSTRAINT "GrowthRecordContent_pkey" PRIMARY KEY ("id","growthRecordId","projectId")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "authorUserId" INTEGER NOT NULL,
    "content" TEXT,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id","questionId","projectId","authorUserId")
);

-- AddForeignKey
ALTER TABLE "user_oauth" ADD CONSTRAINT "user_oauth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthRecord" ADD CONSTRAINT "GrowthRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRole" ADD CONSTRAINT "ProjectRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRole" ADD CONSTRAINT "ProjectRole_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackQuestion" ADD CONSTRAINT "FeedbackQuestion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthRecordContent" ADD CONSTRAINT "GrowthRecordContent_growthRecordId_projectId_fkey" FOREIGN KEY ("growthRecordId", "projectId") REFERENCES "GrowthRecord"("id", "projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthRecordContent" ADD CONSTRAINT "GrowthRecordContent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_questionId_projectId_fkey" FOREIGN KEY ("questionId", "projectId") REFERENCES "FeedbackQuestion"("id", "projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
