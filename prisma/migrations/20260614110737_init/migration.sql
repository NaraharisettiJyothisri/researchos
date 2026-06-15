-- CreateTable
CREATE TABLE "ResearchProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ResearchPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "metrics" TEXT NOT NULL,
    "entities" TEXT NOT NULL,
    "dateRange" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResearchPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ResearchProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "snippet" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reliabilityScore" REAL NOT NULL DEFAULT 0.8,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebSource_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ResearchProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExtractedFact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "sourceId" TEXT,
    "entity" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "date" TEXT,
    "confidence" REAL NOT NULL DEFAULT 1.0,
    "isOutlier" BOOLEAN NOT NULL DEFAULT false,
    "contradictsFactId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExtractedFact_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ResearchProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExtractedFact_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "WebSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResearchReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keyFindings" TEXT NOT NULL,
    "statsTable" TEXT NOT NULL,
    "chartData" TEXT NOT NULL,
    "confidenceScore" REAL NOT NULL DEFAULT 1.0,
    "outlierAnalysis" TEXT,
    "images" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResearchReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ResearchProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatHistory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ResearchProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ResearchPlan_projectId_key" ON "ResearchPlan"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchReport_projectId_key" ON "ResearchReport"("projectId");
