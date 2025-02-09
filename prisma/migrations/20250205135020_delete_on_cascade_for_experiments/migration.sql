-- DropForeignKey
ALTER TABLE "ExperimentSectionContent" DROP CONSTRAINT "ExperimentSectionContent_experimentId_fkey";

-- AddForeignKey
ALTER TABLE "ExperimentSectionContent" ADD CONSTRAINT "ExperimentSectionContent_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
