-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_formId_fkey";

-- AlterTable
ALTER TABLE "Page" ALTER COLUMN "formId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("formId") ON DELETE RESTRICT ON UPDATE CASCADE;
