# 知识库后端服务

基于 PostgreSQL + Express + Prisma 的轻量级知识库后端。

## 功能特性

- ✅ 知识树管理 (CRUD + 嵌套结构)
- ✅ 节点操作 (创建/更新/删除/移动)
- ✅ 卡片管理 (工作流集成)
- ✅ 工作流追踪
- ✅ 资源库管理
- ✅ AI 配置持久化

## 技术栈

- **运行时**: Node.js 18+
- **框架**: Express + TypeScript
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **开发工具**: nodemon, ts-node

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置:

```bash
cp .env.example .env
```

编辑 `.env`:

```env
# 数据库连接(替换为你的数据库信息)
DATABASE_URL="postgresql://user:password@localhost:5432/knowledge_base"

# 服务器配置
PORT=3000
NODE_ENV=development

# CORS配置
FRONTEND_URL=http://localhost:5173
```

### 3. 设置数据库

#### 本地开发(使用 Docker)

```bash
# 启动 PostgreSQL 容器
docker run --name knowledge-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=knowledge_base \
  -p 5432:5432 \
  -d postgres:15
```

#### 云端部署

推荐使用以下服务(均提供免费套餐):
- [Supabase](https://supabase.com) - 免费 500MB
- [Neon](https://neon.tech) - 免费 3GB
- [Railway](https://railway.app) - 免费 $5/月额度

### 4. 运行数据库迁移

```bash
# 生成 Prisma 客户端
npm run prisma:generate

# 创建数据库表
npm run prisma:migrate
```

### 5. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

## API 端点

### 知识树

- `GET /api/trees` - 获取所有知识树
- `GET /api/trees/:id` - 获取单个知识树(含完整节点树)
- `POST /api/trees` - 创建新知识树
- `PUT /api/trees/:id` - 更新知识树
- `DELETE /api/trees/:id` - 删除知识树

### 节点

- `POST /api/nodes` - 创建节点
- `PUT /api/nodes/:id` - 更新节点
- `DELETE /api/nodes/:id` - 删除节点
- `POST /api/nodes/:id/move` - 移动节点
- `GET /api/nodes/:id/sources` - 获取节点来源

### 卡片

- `GET /api/cards/workflow/:workflowId` - 获取工作流的卡片
- `POST /api/cards` - 创建卡片
- `PUT /api/cards/:id` - 更新卡片
- `DELETE /api/cards/:id` - 删除卡片
- `POST /api/cards/:id/apply` - 应用卡片到知识树

### 工作流

- `GET /api/workflows` - 获取所有工作流
- `GET /api/workflows/:id` - 获取单个工作流
- `POST /api/workflows` - 创建工作流
- `PUT /api/workflows/:id` - 更新工作流
- `DELETE /api/workflows/:id` - 删除工作流

### 资源库

- `GET /api/library` - 获取资源库项目
- `POST /api/library` - 创建资源库项目
- `PUT /api/library/:id` - 更新资源库项目
- `DELETE /api/library/:id` - 删除资源库项目

### 配置

- `GET /api/config/ai` - 获取 AI 配置
- `PUT /api/config/ai` - 更新 AI 配置

## 开发命令

```bash
# 开发模式(热重载)
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# Prisma 相关
npm run prisma:generate  # 生成客户端
npm run prisma:migrate   # 运行迁移
npm run prisma:studio    # 打开可视化工具
```

## 数据库管理

### 查看数据

```bash
npm run prisma:studio
```

这将启动 Prisma Studio (http://localhost:5555),可视化管理数据库。

### 创建新迁移

```bash
# 修改 prisma/schema.prisma 后运行
npx prisma migrate dev --name <migration_name>
```

## 生产部署

### 环境变量

确保设置以下环境变量:

```env
DATABASE_URL=<your_production_database_url>
PORT=3000
NODE_ENV=production
FRONTEND_URL=<your_frontend_url>
```

### 部署到云平台

#### Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

#### Railway

1. 连接 GitHub 仓库
2. 自动检测并部署
3. 添加 PostgreSQL 插件

#### Render

1. 创建 Web Service
2. 连接仓库
3. 设置构建命令: `npm run build`
4. 设置启动命令: `npm start`

## 项目结构

```
backend/
├── prisma/
│   └── schema.prisma        # 数据库模型定义
├── src/
│   ├── routes/              # API 路由
│   │   ├── trees.ts         # 知识树路由
│   │   ├── nodes.ts         # 节点路由
│   │   ├── cards.ts         # 卡片路由
│   │   ├── workflows.ts     # 工作流路由
│   │   ├── library.ts       # 资源库路由
│   │   └── config.ts        # 配置路由
│   ├── types/               # TypeScript 类型
│   │   └── index.ts
│   └── index.ts             # 服务器入口
├── .env.example             # 环境变量示例
├── package.json
└── tsconfig.json
```

## 故障排查

### 数据库连接失败

检查 `DATABASE_URL` 格式:
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### 迁移错误

重置数据库:
```bash
npx prisma migrate reset
```

### CORS 错误

确保 `.env` 中的 `FRONTEND_URL` 与前端地址一致。

## License

ISC
