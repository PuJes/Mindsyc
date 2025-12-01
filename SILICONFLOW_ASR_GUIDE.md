# SiliconFlow ASR 集成问题诊断与解决

## 🔍 问题概述

用户在使用 SiliconFlow 进行视频转录时遇到 `400 Bad Request` 错误。

## 📊 诊断结果

### 已确认的问题

1. **音频格式不兼容** ✅ 已修复
   - 问题：从 Bilibili 下载的是 MP4 格式
   - SiliconFlow 支持：MP3, WAV, PCM, Opus
   - 解决：使用 ffmpeg 自动转换 MP4 → MP3

2. **API 参数不兼容** ✅ 已修复
   - 问题：使用了 `verbose_json` 和 `timestamp_granularities`
   - SiliconFlow 只支持：`json` 或 `text` 格式
   - 解决：针对 SiliconFlow 使用 `json` 格式

3. **可能的 API Key 问题** ⚠️ 需要验证
   - 400 错误也可能表示 API Key 无效或无权限
   - 需要用户验证 API Key 是否正确配置

## ✅ 已实施的修复

### 1. 音频格式自动转换

**文件**: `backend/src/services/AudioService.ts`

```typescript
// 下载 MP4 后自动转换为 MP3
async downloadAudio(url: string, referer: string): Promise<string> {
    // ... 下载 MP4 文件
    
    // 使用 ffmpeg 转换
    execSync(`ffmpeg -i "${mp4FilePath}" -vn -ar 16000 -ac 1 -ab 128k -f mp3 "${mp3FilePath}"`);
    
    return mp3FilePath;
}
```

**转换参数说明**:
- `-vn`: 不包含视频
- `-ar 16000`: 采样率 16kHz（适合语音识别）
- `-ac 1`: 单声道
- `-ab 128k`: 比特率 128kbps
- `-f mp3`: 输出格式 MP3

### 2. SiliconFlow 专用 API 参数

```typescript
if (isSiliconFlow) {
    requestParams.response_format = 'json';
    // 不添加 timestamp_granularities
} else {
    requestParams.response_format = 'verbose_json';
    requestParams.timestamp_granularities = ['segment'];
}
```

### 3. 响应格式处理差异

```typescript
if (isSiliconFlow) {
    // 简单格式，手动分割文本
    const text = (transcription as any).text;
    const sentences = text.split(/[。.!！?？\n]+/);
    
    return sentences.map((sentence, index) => ({
        from: index * 5,
        to: (index + 1) * 5,
        content: sentence.trim()
    }));
} else {
    // verbose_json 格式，包含时间戳
    return transcription.segments.map(seg => ({
        from: seg.start,
        to: seg.end,
        content: seg.text.trim()
    }));
}
```

## 📋 用户操作步骤

### 方案 A: 继续使用 SiliconFlow

1. **验证 API Key**
   ```bash
   cd backend
   node test-siliconflow-asr.js YOUR_SILICONFLOW_API_KEY
   ```

2. **检查 API Key 权限**
   - 登录 SiliconFlow 控制台
   - 确认 API Key 有音频转录权限
   - 检查额度是否充足

3. **重新尝试分析视频**
   - 刷新浏览器
   - 输入视频链接
   - 点击"使用 DeepSeek 智能分析"

4. **查看新的日志**
   期望看到：
   ```
   Downloading audio from ...
   Converting audio_xxx.mp4 to MP3 format...
   ✅ Audio converted to MP3: audio_xxx.mp3
   Transcribing ... using https://api.siliconflow.cn/v1
   Request params: {model: 'FunAudioLLM/SenseVoiceSmall', response_format: 'json'}
   ✅ 转录成功
   ```

### 方案 B: 切换到 Groq (推荐)

如果 SiliconFlow 持续失败，建议切换到 **Groq**：

**优势**:
- ✅ 免费且额度充足
- ✅ 速度快（比 SiliconFlow 快 3-5 倍）
- ✅ 质量高（whisper-large-v3 模型）
- ✅ 有完整的时间戳支持

**操作步骤**:
1. 注册 Groq: https://console.groq.com
2. 创建 API Key
3. 在设置页面：
   - 语音转录引擎选择 `Groq`
   - 输入 Groq API Key
4. 重新尝试分析

### 方案 C: 使用 OpenAI (付费)

如果需要最高质量：

1. 使用 OpenAI API Key
2. 语音转录引擎选择 `OpenAI`
3. 费用：约 $0.006 / 分钟

## 🧪 测试脚本说明

### test-siliconflow-asr.js

**用途**: 独立测试 SiliconFlow ASR API

**使用方法**:
```bash
# 方法1: 使用环境变量
SILICONFLOW_API_KEY=your_key node test-siliconflow-asr.js

# 方法2: 使用命令行参数
node test-siliconflow-asr.js your_key
```

**测试流程**:
1. 验证 API Key 格式
2. 查找测试音频文件
3. 调用 SiliconFlow ASR API
4. 显示详细的成功/失败信息

**如果测试失败，会显示可能原因**:
- API Key 无效或已过期
- API Key 没有音频转录权限
- 音频格式不支持
- 音频文件太大
- SiliconFlow 服务暂时不可用

## 🔧 故障排除

### 错误: 400 Bad Request

**可能原因**:
1. ❌ API Key 无效
   - 解决：重新生成 API Key
   
2. ❌ API Key 无权限
   - 解决：在 SiliconFlow 控制台启用音频转录功能
   
3. ❌ 音频文件太大
   - 解决：使用较短的视频测试（<5分钟）
   
4. ❌ 账户额度不足
   - 解决：充值或使用 Groq 免费服务

### 错误: FFmpeg 转换失败

**检查 ffmpeg 安装**:
```bash
which ffmpeg
ffmpeg -version
```

**如果未安装**:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg
```

### 日志中仍显示 MP4 文件

**原因**: 使用的是旧日志，nodemon 重启后需要重新请求

**解决**: 刷新浏览器并重新提交

## 📈 性能对比

| 服务商 | 模型 | 速度 | 成本 | 时间戳 | 推荐度 |
|--------|------|------|------|--------|--------|
| Groq | whisper-large-v3 | ⭐⭐⭐⭐⭐ | 免费 | ✅ 精确 | ⭐⭐⭐⭐⭐ |
| SiliconFlow | SenseVoiceSmall | ⭐⭐⭐ | 免费 | ❌ 估算 | ⭐⭐⭐ |
| OpenAI | whisper-1 | ⭐⭐⭐⭐ | $0.006/分钟 | ✅ 精确 | ⭐⭐⭐⭐ |

**推荐**: 使用 **Groq** - 免费、快速、高质量

## 🎯 下一步行动

1. **立即**: 运行测试脚本验证 SiliconFlow API Key
2. **如果失败**: 切换到 Groq（5分钟即可完成）
3. **测试**: 使用短视频（<3分钟）验证功能
4. **生产**: 确认工作后使用完整视频

## 📝 相关文件

- `/backend/src/services/AudioService.ts` - 音频处理服务
- `/backend/src/controllers/VideoController.ts` - 视频信息提取
- `/backend/test-siliconflow-asr.js` - ASR 测试脚本
- `/DEBUGGING_GUIDE.md` - 完整调试指南
