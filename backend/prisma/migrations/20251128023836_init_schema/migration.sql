-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('FOLDER', 'FILE');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('MERGE', 'ADD');

-- CreateEnum
CREATE TYPE "CardAction" AS ENUM ('MERGE', 'ADD', 'CONFLICT', 'IGNORE');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('IMPORT', 'PROCESSING', 'REVIEW', 'ALIGNMENT', 'COMPLETED');

-- CreateTable
CREATE TABLE "KnowledgeTree" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rootNodeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeTree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreeNode" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "NodeType" NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isModified" BOOLEAN NOT NULL DEFAULT false,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreeNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardSource" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "timestamp" TEXT,
    "reasoning" TEXT,
    "action" "ActionType" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nodeId" TEXT NOT NULL,
    "sourceType" TEXT,
    "sourceTitle" TEXT,
    "sourceUrl" TEXT,
    "sourceSection" TEXT,
    "originalText" TEXT,
    "charPosition" INTEGER,
    "tags" TEXT[],
    "editedBy" TEXT,
    "priority" INTEGER,
    "reviewStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "timestamp" TEXT,
    "summary" TEXT NOT NULL,
    "action" "CardAction" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "targetLabel" TEXT NOT NULL,
    "reasoning" TEXT,
    "workflowId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceTitle" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceContent" TEXT,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'IMPORT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "nodeCount" INTEGER NOT NULL DEFAULT 0,
    "sourceCount" INTEGER NOT NULL DEFAULT 0,
    "coverColor" TEXT NOT NULL DEFAULT '#6366f1',
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiConfig" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeTree_rootNodeId_key" ON "KnowledgeTree"("rootNodeId");

-- CreateIndex
CREATE INDEX "TreeNode_parentId_idx" ON "TreeNode"("parentId");

-- CreateIndex
CREATE INDEX "CardSource_nodeId_idx" ON "CardSource"("nodeId");

-- CreateIndex
CREATE INDEX "Card_workflowId_idx" ON "Card"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "AiConfig_userId_key" ON "AiConfig"("userId");

-- AddForeignKey
ALTER TABLE "KnowledgeTree" ADD CONSTRAINT "KnowledgeTree_rootNodeId_fkey" FOREIGN KEY ("rootNodeId") REFERENCES "TreeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreeNode" ADD CONSTRAINT "TreeNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TreeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardSource" ADD CONSTRAINT "CardSource_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "TreeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
