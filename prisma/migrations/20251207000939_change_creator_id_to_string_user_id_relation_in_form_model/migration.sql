-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_creatorId_fkey";

-- AlterTable
ALTER TABLE "Form" ALTER COLUMN "creatorId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
