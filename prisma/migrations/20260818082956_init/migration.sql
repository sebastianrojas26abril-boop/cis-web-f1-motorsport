-- CreateTable
CREATE TABLE "ContentPiece" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "hook" TEXT,
    "objective" TEXT,
    "pillar" TEXT NOT NULL,
    "funnelStage" TEXT NOT NULL,
    "opportunityScore" DOUBLE PRECISION,
    "persona" TEXT,
    "caso" TEXT,
    "cta" TEXT,
    "voiceOver" TEXT,
    "onScreenText" TEXT,
    "scriptDevelopment" TEXT,
    "editingNotes" TEXT,
    "materials" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IDEA',
    "publishDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" INTEGER,
    "sessionId" INTEGER,

    CONSTRAINT "ContentPiece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sharedMaterial" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordingSession" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "personas" TEXT,
    "autos" TEXT,
    "locaciones" TEXT,
    "materials" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" INTEGER,

    CONSTRAINT "RecordingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shot" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "sessionId" INTEGER,

    CONSTRAINT "Shot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceMetric" (
    "id" SERIAL NOT NULL,
    "platform" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "views" INTEGER,
    "reach" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "saves" INTEGER,
    "messages" INTEGER,
    "leads" INTEGER,
    "appointments" INTEGER,
    "sales" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentPieceId" INTEGER NOT NULL,

    CONSTRAINT "PerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Learning" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentPieceId" INTEGER,

    CONSTRAINT "Learning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "pillars" TEXT NOT NULL,
    "funnelStages" TEXT NOT NULL,
    "objective" TEXT,
    "audience" TEXT,
    "tone" TEXT,
    "restrictions" TEXT,
    "scoreWeights" TEXT NOT NULL,
    "funnelDistribution" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ShotToContent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ShotToContent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentPiece_number_key" ON "ContentPiece"("number");

-- CreateIndex
CREATE INDEX "_ShotToContent_B_index" ON "_ShotToContent"("B");

-- AddForeignKey
ALTER TABLE "ContentPiece" ADD CONSTRAINT "ContentPiece_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ProductionGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPiece" ADD CONSTRAINT "ContentPiece_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RecordingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordingSession" ADD CONSTRAINT "RecordingSession_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ProductionGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shot" ADD CONSTRAINT "Shot_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RecordingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceMetric" ADD CONSTRAINT "PerformanceMetric_contentPieceId_fkey" FOREIGN KEY ("contentPieceId") REFERENCES "ContentPiece"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Learning" ADD CONSTRAINT "Learning_contentPieceId_fkey" FOREIGN KEY ("contentPieceId") REFERENCES "ContentPiece"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShotToContent" ADD CONSTRAINT "_ShotToContent_A_fkey" FOREIGN KEY ("A") REFERENCES "ContentPiece"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShotToContent" ADD CONSTRAINT "_ShotToContent_B_fkey" FOREIGN KEY ("B") REFERENCES "Shot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
