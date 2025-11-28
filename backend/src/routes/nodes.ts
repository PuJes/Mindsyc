import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// 创建节点
router.post('/', async (req: Request, res: Response) => {
    try {
        const { label, type, parentId, isOpen, isNew, isModified, isAiGenerated } = req.body;

        const node = await prisma.treeNode.create({
            data: {
                label,
                type,
                parentId,
                isOpen: isOpen ?? false,
                isNew: isNew ?? false,
                isModified: isModified ?? false,
                isAiGenerated: isAiGenerated ?? false
            }
        });

        res.status(201).json(node);
    } catch (error) {
        console.error('Error creating node:', error);
        res.status(500).json({ error: 'Failed to create node' });
    }
});

// 更新节点
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { label, type, isOpen, isNew, isModified, isAiGenerated } = req.body;

        const node = await prisma.treeNode.update({
            where: { id },
            data: {
                ...(label !== undefined && { label }),
                ...(type !== undefined && { type }),
                ...(isOpen !== undefined && { isOpen }),
                ...(isNew !== undefined && { isNew }),
                ...(isModified !== undefined && { isModified }),
                ...(isAiGenerated !== undefined && { isAiGenerated })
            }
        });

        res.json(node);
    } catch (error) {
        console.error('Error updating node:', error);
        res.status(500).json({ error: 'Failed to update node' });
    }
});

// 删除节点
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.treeNode.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting node:', error);
        res.status(500).json({ error: 'Failed to delete node' });
    }
});

// 移动节点
router.post('/:id/move', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { newParentId } = req.body;

        const node = await prisma.treeNode.update({
            where: { id },
            data: {
                parentId: newParentId
            }
        });

        res.json(node);
    } catch (error) {
        console.error('Error moving node:', error);
        res.status(500).json({ error: 'Failed to move node' });
    }
});

// 获取节点的所有来源
router.get('/:id/sources', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const sources = await prisma.cardSource.findMany({
            where: { nodeId: id },
            orderBy: { importedAt: 'desc' }
        });

        res.json(sources);
    } catch (error) {
        console.error('Error fetching node sources:', error);
        res.status(500).json({ error: 'Failed to fetch node sources' });
    }
});

export default router;
