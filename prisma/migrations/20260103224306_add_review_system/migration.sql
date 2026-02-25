-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionCritique" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "sectionContentId" TEXT NOT NULL,
    "critique" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectionCritique_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_experimentId_reviewerId_key" ON "Review"("experimentId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "SectionCritique_reviewId_sectionContentId_key" ON "SectionCritique"("reviewId", "sectionContentId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionCritique" ADD CONSTRAINT "SectionCritique_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionCritique" ADD CONSTRAINT "SectionCritique_sectionContentId_fkey" FOREIGN KEY ("sectionContentId") REFERENCES "ExperimentSectionContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
