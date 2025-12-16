-- DropForeignKey
ALTER TABLE "FieldAnswer" DROP CONSTRAINT "FieldAnswer_participantId_fkey";

-- DropForeignKey
ALTER TABLE "FormAnswer" DROP CONSTRAINT "FormAnswer_pageId_fkey";

-- DropForeignKey
ALTER TABLE "FormAnswer" DROP CONSTRAINT "FormAnswer_participantId_fkey";

-- DropForeignKey
ALTER TABLE "FormSubmission" DROP CONSTRAINT "FormSubmission_participantId_fkey";

-- DropIndex
DROP INDEX "Page_formId_createdAt_idx";

-- CreateIndex
CREATE INDEX "Page_formId_pageId_createdAt_idx" ON "Page"("formId", "pageId", "createdAt");

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("pageId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("participantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldAnswer" ADD CONSTRAINT "FieldAnswer_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("participantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("participantId") ON DELETE CASCADE ON UPDATE CASCADE;
