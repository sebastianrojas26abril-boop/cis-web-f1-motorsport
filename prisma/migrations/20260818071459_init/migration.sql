-- CreateTable
CREATE TABLE "ContentPiece" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "hook" TEXT,
    "objective" TEXT,
    "pillar" TEXT NOT NULL,
    "funnelStage" TEXT NOT NULL,
    "opportunityScore" REAL,
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
    "publishDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "groupId" INTEGER,
    "sessionId" INTEGER,
    CONSTRAINT "ContentPiece_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ProductionGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ContentPiece_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RecordingSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductionGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sharedMaterial" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RecordingSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "date" DATETIME,
    "personas" TEXT,
    "autos" TEXT,
    "locaciones" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" INTEGER,
    CONSTRAINT "RecordingSession_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ProductionGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Shot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "sessionId" INTEGER,
    CONSTRAINT "Shot_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RecordingSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PerformanceMetric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "platform" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentPieceId" INTEGER NOT NULL,
    CONSTRAINT "PerformanceMetric_contentPieceId_fkey" FOREIGN KEY ("contentPieceId") REFERENCES "ContentPiece" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Learning" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentPieceId" INTEGER,
    CONSTRAINT "Learning_contentPieceId_fkey" FOREIGN KEY ("contentPieceId") REFERENCES "ContentPiece" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StrategyConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "pillars" TEXT NOT NULL,
    "funnelStages" TEXT NOT NULL,
    "objective" TEXT,
    "audience" TEXT,
    "tone" TEXT,
    "restrictions" TEXT,
    "scoreWeights" TEXT NOT NULL,
    "funnelDistribution" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_ShotToContent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ShotToContent_A_fkey" FOREIGN KEY ("A") REFERENCES "ContentPiece" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ShotToContent_B_fkey" FOREIGN KEY ("B") REFERENCES "Shot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentPiece_number_key" ON "ContentPiece"("number");

-- CreateIndex
CREATE UNIQUE INDEX "_ShotToContent_AB_unique" ON "_ShotToContent"("A", "B");

-- CreateIndex
CREATE INDEX "_ShotToContent_B_index" ON "_ShotToContent"("B");
