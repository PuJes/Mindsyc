import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// 导入路由
import treeRoutes from './routes/trees';
import nodeRoutes from './routes/nodes';
import cardRoutes from './routes/cards';
import workflowRoutes from './routes/workflows';
import libraryRoutes from './routes/library';
import configRoutes from './routes/config';
import videoRoutes from './routes/videoRoutes';

// 加载环境变量
dotenv.config();

// 初始化Prisma客户端
export const prisma = new PrismaClient();

// 创建Express应用
const app: Express = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// 健康检查
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/trees', treeRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/config', configRoutes);
app.use('/api/video', videoRoutes);

// 404处理
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
});

// 错误处理
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 启动服务器
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// 优雅关闭
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server...');
    await prisma.$disconnect();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, closing server...');
    await prisma.$disconnect();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
