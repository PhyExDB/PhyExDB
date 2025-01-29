/*
  Warnings:

  - A unique constraint covering the columns `[order]` on the table `ExperimentAttribute` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `multipleSelection` to the `ExperimentAttribute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `ExperimentAttribute` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExperimentAttribute" ADD COLUMN     "multipleSelection" BOOLEAN NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentAttribute_order_key" ON "ExperimentAttribute"("order");
