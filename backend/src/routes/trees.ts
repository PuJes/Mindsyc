import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { TreeNodeData } from '../types';

const router = Router();

// 辅助函数:将数据库TreeNode转换为嵌套结构
async function buildTreeStructure(nodeId: string): Promise<TreeNodeData | null> {
    const node = await prisma.treeNode.findUnique({
        where: { id: nodeId },
        include: {
            children: {
                include: {
                    sources: true
                }
            },
            sources: true
        }
    });

    if (!node) return null;

    const children = await Promise.all(
        node.children.map((child: any) => buildTreeStructure(child.id))
    );

    return {
        id: node.id,
        label: node.label,
        type: node.type as 'FOLDER' | 'FILE',
        isOpen: node.isOpen,
        isNew: node.isNew,
        isModified: node.isModified,
        isAiGenerated: node.isAiGenerated,
        children: children.filter((c: any) => c !== null) as TreeNodeData[],
        sources: node.sources.map((s: any) => ({
            cardId: s.cardId,
            title: s.title,
            summary: s.summary,
            timestamp: s.timestamp || undefined,
            reasoning: s.reasoning || undefined,
            action: s.action as 'MERGE' | 'ADD',
            confidence: s.confidence,
            importedAt: s.importedAt.toISOString(),
            sourceType: s.sourceType || undefined,
            sourceTitle: s.sourceTitle || undefined,
            sourceUrl: s.sourceUrl || undefined,
            sourceSection: s.sourceSection || undefined,
            originalText: s.originalText || undefined,
            charPosition: s.charPosition || undefined,
            tags: s.tags,
            editedBy: s.editedBy || undefined,
            priority: s.priority || undefined,
            reviewStatus: s.reviewStatus || undefined
        }))
    };
}

// 获取所有知识树列表
router.get('/', async (req: Request, res: Response) => {
    try {
        const trees = await prisma.knowledgeTree.findMany({
            orderBy: { updatedAt: 'desc' }
        });

        res.json(trees);
    } catch (error) {
        console.error('Error fetching trees:', error);
        res.status(500).json({ error: 'Failed to fetch trees' });
    }
});

// 获取单个知识树(含完整节点树)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const tree = await prisma.knowledgeTree.findUnique({
            where: { id }
        });

        if (!tree) {
            return res.status(404).json({ error: 'Tree not found' });
        }

        // 构建完整的树结构
        let rootNode = null;
        if (tree.rootNodeId) {
            rootNode = await buildTreeStructure(tree.rootNodeId);
        }

        res.json({
            ...tree,
            rootNode
        });
    } catch (error) {
        console.error('Error fetching tree:', error);
        res.status(500).json({ error: 'Failed to fetch tree' });
    }
});

// 创建新知识树
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, description, rootNode } = req.body;

        // 递归创建节点
        async function createNodeRecursive(nodeData: TreeNodeData, parentId?: string): Promise<string> {
            const { children, sources, ...nodeFields } = nodeData;

            const node = await prisma.treeNode.create({
                data: {
                    ...nodeFields,
                    type: nodeFields.type,
                    parentId,
                    sources: sources ? {
                        create: sources.map((s: any) => ({
                            cardId: s.cardId,
                            title: s.title,
                            summary: s.summary,
                            timestamp: s.timestamp,
                            reasoning: s.reasoning,
                            action: s.action,
                            confidence: s.confidence,
                            importedAt: new Date(s.importedAt),
                            sourceType: s.sourceType,
                            sourceTitle: s.sourceTitle,
                            sourceUrl: s.sourceUrl,
                            sourceSection: s.sourceSection,
                            originalText: s.originalText,
                            charPosition: s.charPosition,
                            tags: s.tags || [],
                            editedBy: s.editedBy,
                            priority: s.priority,
                            reviewStatus: s.reviewStatus
                        }))
                    } : undefined
                }
            });

            // 递归创建子节点
            if (children && children.length > 0) {
                await Promise.all(
                    children.map(child => createNodeRecursive(child, node.id))
                );
            }

            return node.id;
        }

        // 创建根节点(如果提供)
        let rootNodeId = null;
        if (rootNode) {
            rootNodeId = await createNodeRecursive(rootNode);
        }

        // 创建知识树
        const tree = await prisma.knowledgeTree.create({
            data: {
                name,
                description,
                rootNodeId
            }
        });

        res.status(201).json(tree);
    } catch (error) {
        console.error('Error creating tree:', error);
        res.status(500).json({ error: 'Failed to create tree' });
    }
});

// 更新知识树
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, rootNode } = req.body;

        const existingTree = await prisma.knowledgeTree.findUnique({
            where: { id }
        });

        if (!existingTree) {
            return res.status(404).json({ error: 'Tree not found' });
        }

        // 如果提供了新的rootNode,先删除旧的根节点(级联删除所有子节点)
        if (rootNode && existingTree.rootNodeId) {
            await prisma.treeNode.delete({
                where: { id: existingTree.rootNodeId }
            });
        }

        // 创建新的根节点
        let newRootNodeId = existingTree.rootNodeId;
        if (rootNode) {
            async function createNodeRecursive(nodeData: TreeNodeData, parentId?: string): Promise<string> {
                const { children, sources, ...nodeFields } = nodeData;

                const node = await prisma.treeNode.create({
                    data: {
                        ...nodeFields,
                        type: nodeFields.type,
                        parentId,
                        sources: sources ? {
                            create: sources.map((s: any) => ({
                                cardId: s.cardId,
                                title: s.title,
                                summary: s.summary,
                                timestamp: s.timestamp,
                                reasoning: s.reasoning,
                                action: s.action,
                                confidence: s.confidence,
                                importedAt: new Date(s.importedAt),
                                sourceType: s.sourceType,
                                sourceTitle: s.sourceTitle,
                                sourceUrl: s.sourceUrl,
                                sourceSection: s.sourceSection,
                                originalText: s.originalText,
                                charPosition: s.charPosition,
                                tags: s.tags || [],
                                editedBy: s.editedBy,
                                priority: s.priority,
                                reviewStatus: s.reviewStatus
                            }))
                        } : undefined
                    }
                });

                if (children && children.length > 0) {
                    await Promise.all(
                        children.map(child => createNodeRecursive(child, node.id))
                    );
                }

                return node.id;
            }

            newRootNodeId = await createNodeRecursive(rootNode);
        }

        // 更新知识树
        const updatedTree = await prisma.knowledgeTree.update({
            where: { id },
            data: {
                name,
                description,
                rootNodeId: newRootNodeId
            }
        });

        res.json(updatedTree);
    } catch (error) {
        console.error('Error updating tree:', error);
        res.status(500).json({ error: 'Failed to update tree' });
    }
});

// 删除知识树
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const tree = await prisma.knowledgeTree.findUnique({
            where: { id }
        });

        if (!tree) {
            return res.status(404).json({ error: 'Tree not found' });
        }

        // 删除根节点(会级联删除所有子节点)
        if (tree.rootNodeId) {
            await prisma.treeNode.delete({
                where: { id: tree.rootNodeId }
            });
        }

        // 删除知识树
        await prisma.knowledgeTree.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting tree:', error);
        res.status(500).json({ error: 'Failed to delete tree' });
    }
});

export default router;
