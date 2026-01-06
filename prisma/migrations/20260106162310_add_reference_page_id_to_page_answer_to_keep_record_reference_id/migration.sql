-- DropIndex
DROP INDEX "PageAnswer_pageId_participantId_formSubmissionId_createdAt_idx";

-- AlterTable
ALTER TABLE "PageAnswer" ADD COLUMN     "referencePageId" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "PageAnswer_pageId_participantId_formSubmissionId_referenceP_idx" ON "PageAnswer"("pageId", "participantId", "formSubmissionId", "referencePageId", "createdAt");
