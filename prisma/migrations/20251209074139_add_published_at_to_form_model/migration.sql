-- DropIndex
DROP INDEX "Form_title_createdAt_creatorId_idx";

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Form_title_createdAt_creatorId_publishedAt_idx" ON "Form"("title", "createdAt", "creatorId", "publishedAt");
