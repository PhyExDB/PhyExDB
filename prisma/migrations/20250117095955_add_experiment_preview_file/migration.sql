/*
  Warnings:

  - A unique constraint covering the columns `[previewImageId]` on the table `Experiment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN     "previewImageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Experiment_previewImageId_key" ON "Experiment"("previewImageId");

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_previewImageId_fkey" FOREIGN KEY ("previewImageId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
