-- DropForeignKey
ALTER TABLE "ExperimentFile" DROP CONSTRAINT "ExperimentFile_experimentSectionId_fkey";

-- DropForeignKey
ALTER TABLE "UserFile" DROP CONSTRAINT "UserFile_userId_fkey";

-- AddForeignKey
ALTER TABLE "ExperimentFile" ADD CONSTRAINT "ExperimentFile_experimentSectionId_fkey" FOREIGN KEY ("experimentSectionId") REFERENCES "ExperimentSectionContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFile" ADD CONSTRAINT "UserFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
