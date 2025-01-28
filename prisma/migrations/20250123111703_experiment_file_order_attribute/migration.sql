/*
  Warnings:

  - A unique constraint covering the columns `[experimentSectionId,order]` on the table `ExperimentFile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `ExperimentFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExperimentFile" ADD COLUMN     "order" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentFile_experimentSectionId_order_key" ON "ExperimentFile"("experimentSectionId", "order");
