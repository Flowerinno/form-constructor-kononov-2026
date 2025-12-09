-- CreateEnum
CREATE TYPE "FormTheme" AS ENUM ('LIGHT', 'DARK');

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "theme" "FormTheme" NOT NULL DEFAULT 'DARK';
