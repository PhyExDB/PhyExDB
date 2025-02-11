/*
  Warnings:

  - A unique constraint covering the columns `[revisionOfId]` on the table `Experiment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN     "revisionOfId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Experiment_revisionOfId_key" ON "Experiment"("revisionOfId");

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_revisionOfId_fkey" FOREIGN KEY ("revisionOfId") REFERENCES "Experiment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
