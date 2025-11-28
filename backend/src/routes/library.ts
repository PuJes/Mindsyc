import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// 获取所有资源库项目
router.get('/', async (req: Request, res: Response) => {
    try {
        const items = await prisma.libraryItem.findMany({
            orderBy: { updatedAt: 'desc' }
        });

        res.json(items.map((item: any) => ({
            ...item,
            lastUpdated: item.updatedAt.toISOString()
        })));
    } catch (error) {
        console.error('Error fetching library items:', error);
        res.status(500).json({ error: 'Failed to fetch library items' });
    }
});

// 创建资源库项目
router.post('/', async (req: Request, res: Response) => {
    try {
        const { title, nodeCount, sourceCount, coverColor, tags } = req.body;

        const item = await prisma.libraryItem.create({
            data: {
                title,
                nodeCount: nodeCount || 0,
                sourceCount: sourceCount || 0,
                coverColor: coverColor || '#6366f1',
                tags: tags || []
            }
        });

        res.status(201).json({
            ...item,
            lastUpdated: item.updatedAt.toISOString()
        });
    } catch (error) {
        console.error('Error creating library item:', error);
        res.status(500).json({ error: 'Failed to create library item' });
    }
});

// 更新资源库项目
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, nodeCount, sourceCount, coverColor, tags } = req.body;

        const item = await prisma.libraryItem.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(nodeCount !== undefined && { nodeCount }),
                ...(sourceCount !== undefined && { sourceCount }),
                ...(coverColor !== undefined && { coverColor }),
                ...(tags !== undefined && { tags })
            }
        });

        res.json({
            ...item,
            lastUpdated: item.updatedAt.toISOString()
        });
    } catch (error) {
        console.error('Error updating library item:', error);
        res.status(500).json({ error: 'Failed to update library item' });
    }
});

// 删除资源库项目
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.libraryItem.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting library item:', error);
        res.status(500).json({ error: 'Failed to delete library item' });
    }
});

export default router;
