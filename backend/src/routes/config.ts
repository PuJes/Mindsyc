import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// 获取AI配置
router.get('/ai', async (req: Request, res: Response) => {
    try {
        const config = await prisma.aiConfig.findFirst({
            where: { userId: 'default' }
        });

        if (!config) {
            return res.status(404).json({ error: 'Config not found' });
        }

        res.json({
            provider: config.provider,
            apiKey: config.apiKey
        });
    } catch (error) {
        console.error('Error fetching AI config:', error);
        res.status(500).json({ error: 'Failed to fetch AI config' });
    }
});

// 更新AI配置
router.put('/ai', async (req: Request, res: Response) => {
    try {
        const { provider, apiKey } = req.body;

        // 尝试查找现有配置
        const existing = await prisma.aiConfig.findFirst({
            where: { userId: 'default' }
        });

        let config;
        if (existing) {
            // 更新现有配置
            config = await prisma.aiConfig.update({
                where: { id: existing.id },
                data: {
                    ...(provider !== undefined && { provider }),
                    ...(apiKey !== undefined && { apiKey })
                }
            });
        } else {
            // 创建新配置
            config = await prisma.aiConfig.create({
                data: {
                    provider,
                    apiKey,
                    userId: 'default'
                }
            });
        }

        res.json({
            provider: config.provider,
            apiKey: config.apiKey
        });
    } catch (error) {
        console.error('Error updating AI config:', error);
        res.status(500).json({ error: 'Failed to update AI config' });
    }
});

export default router;
