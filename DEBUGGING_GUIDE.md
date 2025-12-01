# 调试指南 - "AI Processing" 卡住问题

## 问题诊断

用户报告在导入视频时，界面一直卡在 "AI Processing" 步骤，无法继续。

### 根本原因

经过诊断，发现以下几个问题：

1. **PostgreSQL 数据库未运行** - Docker 服务未启动
2. **缺少错误处理** - 如果处理失败，前端永远卡在 processing 界面
3. **缺少超时机制** - 视频下载和ASR转录可能需要很长时间

## 已修复的问题

### 1. 错误处理机制 ✅

**文件**: `ImportWorkflow.tsx`

**修改**:
- 添加了 `processingError` 状态来存储错误信息
- 在 `handleAnalysis` 中使用 try-catch 捕获错误
- 错误时返回到 dashboard 界面并显示错误消息
- 添加了详细的控制台日志以便调试

**代码**:
```typescript
const [processingError, setProcessingError] = useState<string | null>(null);

const handleAnalysis = async (config?: TaskConfig) => {
    setProcessingError(null);
    
    try {
        await startProcessing();
    } catch (error: any) {
        console.error('❌ Processing failed:', error);
        setProcessingError(error.message || '处理失败，请重试');
        setCurrentStep('dashboard'); // 返回到 dashboard
    }
};
```

### 2. 错误信息显示 ✅

**文件**: `DashboardStep.tsx`

**修改**:
- 添加了 `errorMessage` 属性
- 在界面顶部显示红色警告框

### 3. 改进的日志输出 ✅

添加了使用表情符号的详细日志：
- 🎬 开始提取视频信息
- 🔑 使用的转录服务
- ✅ 提取成功
- 📝 字幕数量和AI分析
- ❌ 错误信息

## 仍需检查的问题

### 1. 数据库连接 ⚠️

**问题**: PostgreSQL 未运行

**检查方式**:
```bash
docker ps | grep postgres
```

**解决方案**:
```bash
# 启动 Docker
open -a Docker

# 等待 Docker 启动后，启动数据库容器
docker start knowledge-db

# 或者如果容器不存在，创建新容器
docker run --name knowledge-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=knowledge_base \
  -p 5432:5432 \
  -d postgres:15
```

### 2. 后端 API 性能

**问题**: 视频下载和ASR转录可能非常慢

**涉及步骤**:
1. 获取视频页面 HTML
2. 解析视频元数据
3. 下载音频文件（可能很大）
4. 调用ASR API转录（可能需要1-3分钟）
5. AI分析生成卡片

**建议的改进**:
- [ ] 添加超时控制（如 3分钟）
- [ ] 显示真实的处理进度（而不是模拟进度条）
- [ ] 添加WebSocket或SSE实时更新progress
- [ ] 在后端添加任务队列机制

### 3. API Key 配置

**检查**: 确保在设置中正确配置了 API Keys
- 转录服务（Groq / SiliconFlow）
- 分析服务（Gemini / DeepSeek）

## 测试步骤

### 快速测试

1. **启动数据库**:
   ```bash
   open -a Docker
   # 等待5秒
   docker start knowledge-db || docker run --name knowledge-db \
     -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=knowledge_base \
     -p 5432:5432 -d postgres:15
   ```

2. **检查后端**:
   ```bash
   curl http://localhost:3000/api/trees
   # 应该返回JSON而不是错误
   ```

3. **测试视频提取**:
   ```bash
   curl -X POST http://localhost:3000/api/video/extract \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.bilibili.com/video/BV1XX4y1p7yB", "apiKey": "YOUR_KEY", "apiBaseUrl": "https://api.groq.com/openai/v1"}'
   ```

### 完整测试流程

1. 打开浏览器: http://localhost:5173
2. 进入设置，配置 API Keys
3. 返回导入界面
4. 输入一个短视频链接（<5分钟）
5. 打开浏览器控制台查看日志
6. 如果卡住，检查：
   - 浏览器控制台是否有错误
   - 后端终端是否有错误日志
   - 网络请求是否pending或超时

## 监控和调试

### 浏览器控制台

期望看到的日志：
```
🎬 开始提取视频信息: https://...
🔑 使用转录服务: groq
✅ Video Data Extracted: {title: "...", subtitles: [...]}
📝 提取到 42 条字幕，开始 AI 分析...
```

### 后端日志

期望看到：
```
Fetching video page: https://...
Found video: 视频标题 (cid: 123, aid: 456)
Fetching subtitle from: https://...
Transcribing audio_xxx.mp4 using https://api.groq.com/openai/v1 with model whisper-large-v3...
ASR Success: 42 segments
```

## 下一步优化建议

1. **添加进度回调** - 让后端在每个阶段通知前端
2. **队列系统** - 使用 Bull 或 BullMQ 处理长时间任务
3. **缓存机制** - 缓存已处理的视频字幕
4. **重试逻辑** - 自动重试失败的API调用
5. **超时控制** - 设置合理的超时时间
6. **用户反馈** - 显示更详细的处理状态（" Downloading audio 20%..."）

## 相关文件

- `/prototype/knowledge-flow/src/components/Workflow/ImportWorkflow.tsx`
- `/prototype/knowledge-flow/src/components/Workflow/DashboardStep.tsx`
- `/prototype/knowledge-flow/src/components/Workflow/ProcessingStep.tsx`
- `/prototype/knowledge-flow/src/utils/aiUtils.ts`
- `/backend/src/controllers/VideoController.ts`
- `/backend/src/services/AudioService.ts`
