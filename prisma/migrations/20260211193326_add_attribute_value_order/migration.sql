-- DropIndex
DROP INDEX "ExperimentAttribute_order_key";

-- AlterTable
ALTER TABLE "ExperimentAttributeValue" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
