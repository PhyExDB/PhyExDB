/*
  Warnings:

  - You are about to drop the column `description` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `experimentSectionId` on the `File` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_experimentSectionId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "description",
DROP COLUMN "experimentSectionId",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ExperimentFile" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "description" TEXT,
    "experimentSectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperimentFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFile" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "UserFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentFile_fileId_key" ON "ExperimentFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFile_fileId_key" ON "UserFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFile_userId_key" ON "UserFile"("userId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentFile" ADD CONSTRAINT "ExperimentFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentFile" ADD CONSTRAINT "ExperimentFile_experimentSectionId_fkey" FOREIGN KEY ("experimentSectionId") REFERENCES "ExperimentSectionContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFile" ADD CONSTRAINT "UserFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFile" ADD CONSTRAINT "UserFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
