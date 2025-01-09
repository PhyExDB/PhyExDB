/*
  Warnings:

  - You are about to drop the column `order` on the `ExperimentSectionContent` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Experiment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ExperimentSectionContent" DROP COLUMN "order";

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
