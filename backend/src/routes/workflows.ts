import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// 获取所有工作流
router.get('/', async (req: Request, res: Response) => {
    try {
        const workflows = await prisma.workflow.findMany({
            include: {
                cards: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(workflows);
    } catch (error) {
        console.error('Error fetching workflows:', error);
        res.status(500).json({ error: 'Failed to fetch workflows' });
    }
});

// 获取单个工作流
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const workflow = await prisma.workflow.findUnique({
            where: { id },
            include: {
                cards: true
            }
        });

        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }

        res.json(workflow);
    } catch (error) {
        console.error('Error fetching workflow:', error);
        res.status(500).json({ error: 'Failed to fetch workflow' });
    }
});

// 创建新工作流
router.post('/', async (req: Request, res: Response) => {
    try {
        const { sourceType, sourceTitle, sourceUrl, sourceContent } = req.body;

        const workflow = await prisma.workflow.create({
            data: {
                sourceType,
                sourceTitle,
                sourceUrl,
                sourceContent,
                status: 'IMPORT'
            }
        });

        res.status(201).json(workflow);
    } catch (error) {
        console.error('Error creating workflow:', error);
        res.status(500).json({ error: 'Failed to create workflow' });
    }
});

// 更新工作流状态
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, completedAt } = req.body;

        const workflow = await prisma.workflow.update({
            where: { id },
            data: {
                ...(status !== undefined && { status }),
                ...(completedAt !== undefined && { completedAt: new Date(completedAt) })
            }
        });

        res.json(workflow);
    } catch (error) {
        console.error('Error updating workflow:', error);
        res.status(500).json({ error: 'Failed to update workflow' });
    }
});

// 删除工作流
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.workflow.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting workflow:', error);
        res.status(500).json({ error: 'Failed to delete workflow' });
    }
});

export default router;
