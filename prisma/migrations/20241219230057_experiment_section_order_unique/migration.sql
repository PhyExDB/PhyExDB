/*
  Warnings:

  - A unique constraint covering the columns `[order]` on the table `ExperimentSection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ExperimentSection_order_key" ON "ExperimentSection"("order");
