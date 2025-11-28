import { PrismaClient, NodeType } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

type FrontendTreeNode = {
    id: string;
    label: string;
    type: 'folder' | 'file';
    isOpen?: boolean;
    children?: FrontendTreeNode[];
};

type SeedTree = {
    id: string;
    title: string;
    description?: string;
    root: FrontendTreeNode;
};

// 从前端 constants 拷贝的初始知识库数据（精简为结构化数据）
const SEED_TREES: SeedTree[] = [
    {
        id: 'kb-1',
        title: '一人公司 (The One-Person Company)',
        description: '前端初始知识库：一人公司',
        root: {
            id: 'root',
            label: '一人公司 (The One-Person Company)',
            type: 'folder',
            isOpen: true,
            children: [
                {
                    id: '1-mindset',
                    label: '1. 顶层设计 (Mindset & Strategy)',
                    type: 'folder',
                    isOpen: true,
                    children: [
                        {
                            id: '1-1-core',
                            label: '1.1 核心理念',
                            type: 'folder',
                            children: [
                                { id: '1-1-1', label: '产品化你自己 (Productize Yourself)', type: 'file' },
                                { id: '1-1-2', label: '用系统代替人工 (System > Hustle)', type: 'file' },
                                { id: '1-1-3', label: '追求利润率而非规模 (Profit > Revenue)', type: 'file' }
                            ]
                        },
                        {
                            id: '1-2-model',
                            label: '1.2 商业模式选择',
                            type: 'folder',
                            children: [
                                { id: '1-2-1', label: '知识付费 (课程/电子书)', type: 'file' },
                                { id: '1-2-2', label: '产品化服务 (Productized Service)', type: 'file' },
                                { id: '1-2-3', label: 'SaaS/微型软件', type: 'file' },
                                { id: '1-2-4', label: '内容创作者 (广告/赞助)', type: 'file' }
                            ]
                        }
                    ]
                },
                {
                    id: '2-offer',
                    label: '2. 产品/服务 (The Offer)',
                    type: 'folder',
                    isOpen: true,
                    children: [
                        {
                            id: '2-1-niche',
                            label: '2.1 痛点定位',
                            type: 'folder',
                            children: [
                                { id: '2-1-1', label: '目标客户是谁？(Niche)', type: 'file' },
                                { id: '2-1-2', label: '解决什么昂贵或紧急的问题？', type: 'file' }
                            ]
                        },
                        {
                            id: '2-2-delivery',
                            label: '2.2 交付形态',
                            type: 'folder',
                            children: [
                                { id: '2-2-1', label: '标准化交付 (减少定制)', type: 'file' },
                                { id: '2-2-2', label: '边际成本趋近于零', type: 'file' }
                            ]
                        }
                    ]
                },
                {
                    id: '3-growth',
                    label: '3. 流量与获客 (Growth)',
                    type: 'folder',
                    isOpen: true,
                    children: [
                        {
                            id: '3-1',
                            label: '3.1 内容营销',
                            type: 'folder',
                            isOpen: true,
                            children: [
                                { id: '3-1-1', label: '建立个人IP (Building in public)', type: 'file' },
                                { id: '3-1-2', label: 'SEO (搜索引擎优化)', type: 'file' }
                            ]
                        },
                        {
                            id: '3-2',
                            label: '3.2 渠道建设',
                            type: 'folder',
                            isOpen: true,
                            children: [
                                { id: '3-2-1', label: '公域引流 (知乎、小红书、Twitter/X)', type: 'file' },
                                { id: '3-2-2', label: '私域沉淀 (邮件列表/Newsletter、微信群)', type: 'file' }
                            ]
                        }
                    ]
                },
                {
                    id: '4-ops',
                    label: '4. 运营与系统 (Operations)',
                    type: 'folder',
                    isOpen: true,
                    children: [
                        {
                            id: '4-1',
                            label: '4.1 自动化工具栈',
                            type: 'folder',
                            children: [
                                { id: '4-1-1', label: '支付与结算 (Stripe, 微信支付)', type: 'file' },
                                { id: '4-1-2', label: '客户管理 (Notion, CRM)', type: 'file' },
                                { id: '4-1-3', label: '流程自动化 (Zapier, Make)', type: 'file' }
                            ]
                        },
                        {
                            id: '4-2',
                            label: '4.2 外包协作',
                            type: 'folder',
                            children: [
                                { id: '4-2-1', label: '非核心业务外包 (会计、法务、基础剪辑)', type: 'file' }
                            ]
                        }
                    ]
                },
                {
                    id: '5-finance',
                    label: '5. 财务与风控',
                    type: 'folder',
                    children: [
                        { id: '5-1', label: '现金流管理', type: 'file' },
                        { id: '5-2', label: '法律实体与税务筹划', type: 'file' }
                    ]
                }
            ]
        }
    },
    {
        id: 'kb-2',
        title: '个人投资体系 (Personal Investment)',
        description: '前端初始知识库：个人投资体系',
        root: {
            id: 'root-inv',
            label: '个人投资体系 (Personal Investment System)',
            type: 'folder',
            isOpen: true,
            children: [
                {
                    id: 'inv-1',
                    label: '1. 自我认知 (KYC)',
                    type: 'folder',
                    isOpen: true,
                    children: [
                        { id: 'inv-1-1', label: '投资目标 (现金流 vs 增值)', type: 'file' },
                        { id: 'inv-1-2', label: '风险偏好 (最大回撤/能力圈)', type: 'file' }
                    ]
                },
                {
                    id: 'inv-2',
                    label: '2. 资产配置 (Asset Allocation)',
                    type: 'folder',
                    isOpen: true,
                    children: [
                        { id: 'inv-2-1', label: '全球资产分散', type: 'file' },
                        { id: 'inv-2-2', label: '防御+进攻双账户', type: 'file' },
                        { id: 'inv-2-3', label: '现金流 vs 增长组合', type: 'file' }
                    ]
                },
                {
                    id: 'inv-3',
                    label: '3. 策略与执行',
                    type: 'folder',
                    children: [
                        { id: 'inv-3-1', label: '定投与再平衡', type: 'file' },
                        { id: 'inv-3-2', label: '择时与风控', type: 'file' }
                    ]
                }
            ]
        }
    },
    {
        id: 'kb-3',
        title: '如何做自媒体 (Content Strategy)',
        description: '前端初始知识库：自媒体策略',
        root: {
            id: 'root-media',
            label: '如何做自媒体 (Content Strategy)',
            type: 'folder',
            isOpen: true,
            children: [
                {
                    id: 'media-1',
                    label: '1. 选题与定位',
                    type: 'folder',
                    children: [
                        { id: 'media-1-1', label: '垂直领域与人设', type: 'file' },
                        { id: 'media-1-2', label: '差异化视角', type: 'file' }
                    ]
                },
                {
                    id: 'media-2',
                    label: '2. 生产与分发',
                    type: 'folder',
                    children: [
                        { id: 'media-2-1', label: '脚本/提纲模板', type: 'file' },
                        { id: 'media-2-2', label: '多平台分发', type: 'file' }
                    ]
                },
                {
                    id: 'media-3',
                    label: '3. 变现路径',
                    type: 'folder',
                    children: [
                        { id: 'media-3-1', label: '广告/赞助', type: 'file' },
                        { id: 'media-3-2', label: '知识付费/社群', type: 'file' }
                    ]
                }
            ]
        }
    }
];

async function createNode(node: FrontendTreeNode, parentId?: string) {
    const created = await prisma.treeNode.create({
        data: {
            id: node.id,
            label: node.label,
            type: node.type.toUpperCase() as NodeType,
            parentId,
            isOpen: node.isOpen ?? false
        }
    });

    if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            await createNode(child, created.id);
        }
    }

    return created.id;
}

async function seed() {
    console.log('🚀 开始导入前端初始知识库数据...');
    for (const tree of SEED_TREES) {
        const exists = await prisma.knowledgeTree.findFirst({
            where: { name: tree.id }
        });
        if (exists) {
            console.log(`ℹ️ 已存在知识库 ${tree.id}，跳过`);
            continue;
        }

        console.log(`➡️  创建知识库 ${tree.id}`);
        await createNode(tree.root);
        await prisma.knowledgeTree.create({
            data: {
                id: tree.id,
                name: tree.id,
                description: tree.description,
                rootNodeId: tree.root.id
            }
        });
        console.log(`✅ 已创建知识库 ${tree.id}`);
    }
    console.log('🎉 完成导入');
}

seed()
    .catch(err => {
        console.error('❌ 导入失败', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
