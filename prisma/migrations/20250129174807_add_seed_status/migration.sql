-- CreateTable
CREATE TABLE "SeedStatus" (
    "id" TEXT NOT NULL,
    "seedName" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeedStatus_pkey" PRIMARY KEY ("id")
);
