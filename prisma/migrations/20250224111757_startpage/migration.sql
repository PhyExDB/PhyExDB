-- AlterTable
ALTER TABLE "File" ADD COLUMN     "startpageId" BOOLEAN;

-- CreateTable
CREATE TABLE "Startpage" (
    "id" BOOLEAN NOT NULL DEFAULT true,
    "text" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Startpage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_startpageId_fkey" FOREIGN KEY ("startpageId") REFERENCES "Startpage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
