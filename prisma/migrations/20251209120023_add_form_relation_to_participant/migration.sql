/*
  Warnings:

  - You are about to drop the column `fieldId` on the `FormAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `formId` on the `FormAnswer` table. All the data in the column will be lost.
  - You are about to drop the `FormField` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pageId` to the `FormAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formId` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FormAnswer" DROP CONSTRAINT "FormAnswer_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "FormAnswer" DROP CONSTRAINT "FormAnswer_formId_fkey";

-- DropForeignKey
ALTER TABLE "FormAnswer" DROP CONSTRAINT "FormAnswer_participantId_fkey";

-- DropForeignKey
ALTER TABLE "FormField" DROP CONSTRAINT "FormField_pageId_fkey";

-- DropIndex
DROP INDEX "FormAnswer_fieldId_idx";

-- AlterTable
ALTER TABLE "FormAnswer" DROP COLUMN "fieldId",
DROP COLUMN "formId",
ADD COLUMN     "pageId" TEXT NOT NULL,
ALTER COLUMN "participantId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "formId" TEXT NOT NULL,
ADD COLUMN     "lastVisited" TIMESTAMP(3);

-- DropTable
DROP TABLE "FormField";

-- CreateIndex
CREATE INDEX "FormAnswer_pageId_participantId_createdAt_idx" ON "FormAnswer"("pageId", "participantId", "createdAt");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("formId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("pageId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("participantId") ON DELETE RESTRICT ON UPDATE CASCADE;
