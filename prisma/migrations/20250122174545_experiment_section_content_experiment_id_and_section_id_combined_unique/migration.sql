/*
  Warnings:

  - A unique constraint covering the columns `[experimentId,experimentSectionId]` on the table `ExperimentSectionContent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ExperimentSectionContent_experimentId_experimentSectionId_key" ON "ExperimentSectionContent"("experimentId", "experimentSectionId");
