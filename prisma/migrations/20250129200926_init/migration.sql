-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ExperimentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT,
    "status" "ExperimentStatus" NOT NULL DEFAULT 'DRAFT',
    "duration" INTEGER NOT NULL,
    "previewImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperimentSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentSectionContent" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "experimentSectionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperimentSectionContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentAttribute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "multipleSelection" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperimentAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentAttributeValue" (
    "id" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperimentAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentFile" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "description" TEXT,
    "experimentSectionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
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

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "impersonatedBy" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "userId" TEXT,
    "experimentId" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeedStatus" (
    "name" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeedStatus_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "_ExperimentToExperimentAttributeValue" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExperimentToExperimentAttributeValue_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LegalDocument_slug_key" ON "LegalDocument"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Experiment_slug_key" ON "Experiment"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Experiment_previewImageId_key" ON "Experiment"("previewImageId");

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentSection_slug_key" ON "ExperimentSection"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentSection_order_key" ON "ExperimentSection"("order");

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentSectionContent_experimentId_experimentSectionId_key" ON "ExperimentSectionContent"("experimentId", "experimentSectionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentAttribute_slug_key" ON "ExperimentAttribute"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentAttribute_order_key" ON "ExperimentAttribute"("order");

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentAttributeValue_slug_key" ON "ExperimentAttributeValue"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentFile_fileId_key" ON "ExperimentFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentFile_experimentSectionId_order_key" ON "ExperimentFile"("experimentSectionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "UserFile_fileId_key" ON "UserFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFile_userId_key" ON "UserFile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "_ExperimentToExperimentAttributeValue_B_index" ON "_ExperimentToExperimentAttributeValue"("B");

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_previewImageId_fkey" FOREIGN KEY ("previewImageId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentSectionContent" ADD CONSTRAINT "ExperimentSectionContent_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentSectionContent" ADD CONSTRAINT "ExperimentSectionContent_experimentSectionId_fkey" FOREIGN KEY ("experimentSectionId") REFERENCES "ExperimentSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentAttributeValue" ADD CONSTRAINT "ExperimentAttributeValue_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "ExperimentAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentFile" ADD CONSTRAINT "ExperimentFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentFile" ADD CONSTRAINT "ExperimentFile_experimentSectionId_fkey" FOREIGN KEY ("experimentSectionId") REFERENCES "ExperimentSectionContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFile" ADD CONSTRAINT "UserFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFile" ADD CONSTRAINT "UserFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExperimentToExperimentAttributeValue" ADD CONSTRAINT "_ExperimentToExperimentAttributeValue_A_fkey" FOREIGN KEY ("A") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExperimentToExperimentAttributeValue" ADD CONSTRAINT "_ExperimentToExperimentAttributeValue_B_fkey" FOREIGN KEY ("B") REFERENCES "ExperimentAttributeValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
