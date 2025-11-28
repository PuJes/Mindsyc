# 知识库系统 - 快速开始指南

本指南将帮助您快速启动知识库系统的前后端。

## 架构概览

```
AI个人知识库/
├── prototype/knowledge-flow/    # 前端 (React + Vite)
└── backend/                     # 后端 (Express + PostgreSQL)
```

## 启动步骤

### 方式一:仅前端(localStorage模式)

如果您只想体验前端功能,无需启动后端:

```bash
cd prototype/knowledge-flow
npm install
npm run dev
```

前端将在 `http://localhost:5173` 启动,数据存储在浏览器localStorage中。

### 方式二:完整系统(前端 + 后端)

#### 1. 启动后端

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件,配置数据库连接

# 启动PostgreSQL数据库(使用Docker)
docker run --name knowledge-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=knowledge_base \
  -p 5432:5432 \
  -d postgres:15

# 运行数据库迁移
npm run prisma:generate
npm run prisma:migrate

# 启动后端服务器
npm run dev
```

后端将在 `http://localhost:3000` 启动。

#### 2. 配置并启动前端

```bash
cd prototype/knowledge-flow

# 创建环境变量文件
cat > .env << EOF
VITE_USE_BACKEND=true
VITE_API_URL=http://localhost:3000/api
EOF

# 启动前端(如果已安装依赖可跳过npm install)
npm run dev
```

前端将在 `http://localhost:5173` 启动,并连接到后端API。

## 验证安装

### 检查后端

```bash
# 健康检查
curl http://localhost:3000/health

# 应返回: {"status":"ok","timestamp":"..."}

# 测试API
curl http://localhost:3000/api/trees

# 应返回: []  (空数组,表示暂无知识树)
```

### 检查前端

1. 打开浏览器访问 `http://localhost:5173`
2. 应该能看到知识库界面
3. 尝试导入内容并创建知识卡片
4. 刷新页面,数据应该保持

## 切换模式

### 从localStorage切换到后端

编辑 `prototype/knowledge-flow/.env`:

```env
VITE_USE_BACKEND=true
VITE_API_URL=http://localhost:3000/api
```

重启前端开发服务器。

### 从后端切换到localStorage

编辑 `prototype/knowledge-flow/.env`:

```env
VITE_USE_BACKEND=false
```

重启前端开发服务器。

## 数据管理

### 查看数据库数据

```bash
cd backend
npm run prisma:studio
```

这将打开Prisma Studio (`http://localhost:5555`),可视化查看和编辑数据库。

### 数据迁移(从localStorage到数据库)

目前数据存储方式:
- **localStorage模式**: 数据在浏览器本地存储
- **后端模式**: 数据在PostgreSQL数据库

切换到后端模式时,需要重新创建知识树。未来可添加导入导出功能。

## 常见问题

### 后端无法连接数据库

检查:
1. PostgreSQL是否在运行: `docker ps | grep knowledge-db`
2. 数据库连接字符串是否正确: 查看 `backend/.env`
3. 端口5432是否被占用

### 前端无法连接后端

检查:
1. 后端是否在运行: `curl http://localhost:3000/health`
2. CORS配置: 确保 `backend/.env` 中的 `FRONTEND_URL` 正确
3. 前端环境变量: 确保 `VITE_API_URL` 指向正确的后端地址

### 数据丢失

- **localStorage模式**: 清除浏览器数据会丢失所有内容
- **后端模式**: 数据持久化在数据库中,更安全

建议生产环境使用后端模式。

## 下一步

- 📖 阅读 [`backend/README.md`](file:///Users/jesspu/codes/AI个人知识库/backend/README.md) 了解API文档
- 🚀 查看部署指南准备云端部署
- 🔧 根据需求自定义配置

## 开发命令速查

```bash
# 前端
cd prototype/knowledge-flow
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本

# 后端
cd backend
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm start            # 启动生产服务器
npm run prisma:studio  # 数据库可视化工具
```
