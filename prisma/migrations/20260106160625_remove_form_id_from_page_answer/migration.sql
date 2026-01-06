/*
  Warnings:

  - You are about to drop the column `formId` on the `PageAnswer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PageAnswer" DROP CONSTRAINT "PageAnswer_formId_fkey";

-- DropIndex
DROP INDEX "Page_formId_pageId_createdAt_idx";

-- DropIndex
DROP INDEX "PageAnswer_pageId_participantId_formSubmissionId_formId_cre_idx";

-- AlterTable
ALTER TABLE "PageAnswer" DROP COLUMN "formId";

-- CreateIndex
CREATE INDEX "Page_formId_pageId_pageNumber_createdAt_idx" ON "Page"("formId", "pageId", "pageNumber", "createdAt");

-- CreateIndex
CREATE INDEX "PageAnswer_pageId_participantId_formSubmissionId_createdAt_idx" ON "PageAnswer"("pageId", "participantId", "formSubmissionId", "createdAt");
