/*
  Warnings:

  - You are about to drop the column `name` on the `ExperimentAttributeValue` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `ExperimentAttributeValue` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `ExperimentSection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `ExperimentAttributeValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `ExperimentAttributeValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `ExperimentSection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExperimentAttributeValue" DROP COLUMN "name",
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ExperimentSection" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentAttributeValue_slug_key" ON "ExperimentAttributeValue"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentSection_slug_key" ON "ExperimentSection"("slug");
