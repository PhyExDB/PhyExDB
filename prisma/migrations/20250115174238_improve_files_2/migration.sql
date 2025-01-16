/*
  Warnings:

  - Made the column `experimentSectionId` on table `ExperimentFile` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ExperimentFile" DROP CONSTRAINT "ExperimentFile_experimentSectionId_fkey";

-- AlterTable
ALTER TABLE "ExperimentFile" ALTER COLUMN "experimentSectionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ExperimentFile" ADD CONSTRAINT "ExperimentFile_experimentSectionId_fkey" FOREIGN KEY ("experimentSectionId") REFERENCES "ExperimentSectionContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
