import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// 获取工作流的所有卡片
router.get('/workflow/:workflowId', async (req: Request, res: Response) => {
    try {
        const { workflowId } = req.params;

        const cards = await prisma.card.findMany({
            where: { workflowId },
            orderBy: { createdAt: 'asc' }
        });

        res.json(cards);
    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

// 创建卡片
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            title,
            timestamp,
            summary,
            action,
            confidence,
            targetNodeId,
            targetLabel,
            reasoning,
            workflowId
        } = req.body;

        const card = await prisma.card.create({
            data: {
                title,
                timestamp,
                summary,
                action,
                confidence,
                targetNodeId,
                targetLabel,
                reasoning,
                workflowId
            }
        });

        res.status(201).json(card);
    } catch (error) {
        console.error('Error creating card:', error);
        res.status(500).json({ error: 'Failed to create card' });
    }
});

// 更新卡片
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, timestamp, summary, action, confidence, targetNodeId, targetLabel, reasoning } = req.body;

        const card = await prisma.card.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(timestamp !== undefined && { timestamp }),
                ...(summary !== undefined && { summary }),
                ...(action !== undefined && { action }),
                ...(confidence !== undefined && { confidence }),
                ...(targetNodeId !== undefined && { targetNodeId }),
                ...(targetLabel !== undefined && { targetLabel }),
                ...(reasoning !== undefined && { reasoning })
            }
        });

        res.json(card);
    } catch (error) {
        console.error('Error updating card:', error);
        res.status(500).json({ error: 'Failed to update card' });
    }
});

// 删除卡片
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.card.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting card:', error);
        res.status(500).json({ error: 'Failed to delete card' });
    }
});

// 应用卡片到知识树
router.post('/:id/apply', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const card = await prisma.card.findUnique({
            where: { id }
        });

        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        // 创建CardSource记录
        const cardSource = await prisma.cardSource.create({
            data: {
                cardId: card.id,
                title: card.title,
                summary: card.summary,
                timestamp: card.timestamp,
                reasoning: card.reasoning,
                action: card.action === 'MERGE' ? 'MERGE' : 'ADD',
                confidence: card.confidence,
                nodeId: card.targetNodeId
            }
        });

        // 更新节点状态
        await prisma.treeNode.update({
            where: { id: card.targetNodeId },
            data: {
                isModified: true,
                isAiGenerated: true
            }
        });

        res.status(201).json(cardSource);
    } catch (error) {
        console.error('Error applying card:', error);
        res.status(500).json({ error: 'Failed to apply card' });
    }
});

export default router;
