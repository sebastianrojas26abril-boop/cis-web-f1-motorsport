-- AlterTable
ALTER TABLE "ContentPiece" ADD COLUMN     "facebookPostId" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramMediaId" TEXT,
ADD COLUMN     "instagramUrl" TEXT;

-- AlterTable
ALTER TABLE "PerformanceMetric" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'MANUAL';

-- CreateTable
CREATE TABLE "MetaConnection" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "pageId" TEXT NOT NULL,
    "pageName" TEXT,
    "pageAccessToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "instagramBusinessId" TEXT,
    "instagramUsername" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaConnection_pkey" PRIMARY KEY ("id")
);
