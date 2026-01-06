/*
  Warnings:

  - You are about to drop the column `pageAnswerId` on the `Page` table. All the data in the column will be lost.
  - Added the required column `pageId` to the `PageAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_pageAnswerId_fkey";

-- DropIndex
DROP INDEX "Page_pageAnswerId_key";

-- DropIndex
DROP INDEX "PageAnswer_participantId_formSubmissionId_formId_createdAt_idx";

-- AlterTable
ALTER TABLE "Page" DROP COLUMN "pageAnswerId";

-- AlterTable
ALTER TABLE "PageAnswer" ADD COLUMN     "pageId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "PageAnswer_pageId_participantId_formSubmissionId_formId_cre_idx" ON "PageAnswer"("pageId", "participantId", "formSubmissionId", "formId", "createdAt");

-- AddForeignKey
ALTER TABLE "PageAnswer" ADD CONSTRAINT "PageAnswer_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("pageId") ON DELETE CASCADE ON UPDATE CASCADE;
