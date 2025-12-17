/*
  Warnings:

  - A unique constraint covering the columns `[submissionId]` on the table `FormSubmission` will be added. If there are existing duplicate values, this will fail.
  - The required column `submissionId` was added to the `FormSubmission` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "FormSubmission" ADD COLUMN     "submissionId" TEXT NOT NULL DEFAULT gen_random_uuid();

-- CreateIndex
CREATE UNIQUE INDEX "FormSubmission_submissionId_key" ON "FormSubmission"("submissionId");
