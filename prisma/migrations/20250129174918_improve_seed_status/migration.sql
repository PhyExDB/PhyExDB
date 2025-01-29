/*
  Warnings:

  - The primary key for the `SeedStatus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `SeedStatus` table. All the data in the column will be lost.
  - You are about to drop the column `seedName` on the `SeedStatus` table. All the data in the column will be lost.
  - Added the required column `name` to the `SeedStatus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SeedStatus" DROP CONSTRAINT "SeedStatus_pkey",
DROP COLUMN "id",
DROP COLUMN "seedName",
ADD COLUMN     "name" TEXT NOT NULL,
ADD CONSTRAINT "SeedStatus_pkey" PRIMARY KEY ("name");
