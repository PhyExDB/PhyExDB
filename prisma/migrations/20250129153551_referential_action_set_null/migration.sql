-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Experiment" DROP CONSTRAINT "Experiment_userId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_createdById_fkey";

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Experiment" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "File" ALTER COLUMN "createdById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
