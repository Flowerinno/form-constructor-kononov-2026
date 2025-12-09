-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_formId_fkey";

-- AlterTable
ALTER TABLE "Form" ALTER COLUMN "pagesTotal" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("formId") ON DELETE CASCADE ON UPDATE CASCADE;
