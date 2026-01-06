-- DropForeignKey
ALTER TABLE "PageAnswer" DROP CONSTRAINT "PageAnswer_pageId_fkey";

-- AlterTable
ALTER TABLE "PageAnswer" ALTER COLUMN "pageId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PageAnswer" ADD CONSTRAINT "PageAnswer_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("pageId") ON DELETE SET NULL ON UPDATE CASCADE;
