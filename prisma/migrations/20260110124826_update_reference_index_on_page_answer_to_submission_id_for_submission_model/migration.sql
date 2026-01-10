-- DropForeignKey
ALTER TABLE "PageAnswer" DROP CONSTRAINT "PageAnswer_formSubmissionId_fkey";

-- AddForeignKey
ALTER TABLE "PageAnswer" ADD CONSTRAINT "PageAnswer_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "FormSubmission"("submissionId") ON DELETE CASCADE ON UPDATE CASCADE;
