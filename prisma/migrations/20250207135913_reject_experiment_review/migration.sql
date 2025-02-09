-- AlterEnum
ALTER TYPE "ExperimentStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN     "changeRequest" TEXT;
