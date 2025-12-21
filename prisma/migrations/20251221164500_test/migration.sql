/*
  Warnings:

  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Experiment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExperimentAttribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExperimentAttributeValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExperimentFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExperimentSection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExperimentSectionContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LegalDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeedStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Startpage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ExperimentToExperimentAttributeValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_experimentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Experiment" DROP CONSTRAINT "Experiment_previewImageId_fkey";

-- DropForeignKey
ALTER TABLE "Experiment" DROP CONSTRAINT "Experiment_revisionOfId_fkey";

-- DropForeignKey
ALTER TABLE "Experiment" DROP CONSTRAINT "Experiment_userId_fkey";

-- DropForeignKey
ALTER TABLE "ExperimentAttributeValue" DROP CONSTRAINT "ExperimentAttributeValue_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "ExperimentFile" DROP CONSTRAINT "ExperimentFile_experimentSectionId_fkey";

-- DropForeignKey
ALTER TABLE "ExperimentFile" DROP CONSTRAINT "ExperimentFile_fileId_fkey";

-- DropForeignKey
ALTER TABLE "ExperimentSectionContent" DROP CONSTRAINT "ExperimentSectionContent_experimentId_fkey";

-- DropForeignKey
ALTER TABLE "ExperimentSectionContent" DROP CONSTRAINT "ExperimentSectionContent_experimentSectionId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_createdById_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_startpageId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_experimentId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserFile" DROP CONSTRAINT "UserFile_fileId_fkey";

-- DropForeignKey
ALTER TABLE "UserFile" DROP CONSTRAINT "UserFile_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ExperimentToExperimentAttributeValue" DROP CONSTRAINT "_ExperimentToExperimentAttributeValue_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExperimentToExperimentAttributeValue" DROP CONSTRAINT "_ExperimentToExperimentAttributeValue_B_fkey";

-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_userId_fkey";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Experiment";

-- DropTable
DROP TABLE "ExperimentAttribute";

-- DropTable
DROP TABLE "ExperimentAttributeValue";

-- DropTable
DROP TABLE "ExperimentFile";

-- DropTable
DROP TABLE "ExperimentSection";

-- DropTable
DROP TABLE "ExperimentSectionContent";

-- DropTable
DROP TABLE "File";

-- DropTable
DROP TABLE "LegalDocument";

-- DropTable
DROP TABLE "Rating";

-- DropTable
DROP TABLE "SeedStatus";

-- DropTable
DROP TABLE "Startpage";

-- DropTable
DROP TABLE "UserFile";

-- DropTable
DROP TABLE "_ExperimentToExperimentAttributeValue";

-- DropTable
DROP TABLE "account";

-- DropTable
DROP TABLE "session";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "verification";

-- DropEnum
DROP TYPE "ExperimentStatus";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "LegalDocument2" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "text2" TEXT NOT NULL,

    CONSTRAINT "LegalDocument2_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LegalDocument2_slug_key" ON "LegalDocument2"("slug");
