/*
  Warnings:

  - Added the required column `formId` to the `FormAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormAnswer" ADD COLUMN     "formId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("formId") ON DELETE RESTRICT ON UPDATE CASCADE;
