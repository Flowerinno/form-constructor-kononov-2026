-- DropForeignKey
ALTER TABLE "FieldAnswer" DROP CONSTRAINT "FieldAnswer_formAnswerId_fkey";

-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "FormAnswer" DROP CONSTRAINT "FormAnswer_formId_fkey";

-- DropForeignKey
ALTER TABLE "FormAnswer" DROP CONSTRAINT "FormAnswer_formSubmissionId_fkey";

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("formId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldAnswer" ADD CONSTRAINT "FieldAnswer_formAnswerId_fkey" FOREIGN KEY ("formAnswerId") REFERENCES "FormAnswer"("answerId") ON DELETE CASCADE ON UPDATE CASCADE;
