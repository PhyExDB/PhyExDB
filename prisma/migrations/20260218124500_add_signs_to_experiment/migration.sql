-- CreateEnum
CREATE TYPE "SignType" AS ENUM ('WARNING', 'SAFETY');

-- CreateTable
CREATE TABLE "Sign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SignType" NOT NULL,
    "iconPath" TEXT NOT NULL,

    CONSTRAINT "Sign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ExperimentSigns" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExperimentSigns_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ExperimentSigns_B_index" ON "_ExperimentSigns"("B");

-- AddForeignKey
ALTER TABLE "_ExperimentSigns" ADD CONSTRAINT "_ExperimentSigns_A_fkey" FOREIGN KEY ("A") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExperimentSigns" ADD CONSTRAINT "_ExperimentSigns_B_fkey" FOREIGN KEY ("B") REFERENCES "Sign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

