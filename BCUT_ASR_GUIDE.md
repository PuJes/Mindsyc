# Bilibili Bcut ASR 使用指南

## 简介
Bilibili 必剪（Bcut）提供**免费**的中文语音识别服务，但需要您的 Bilibili 登录状态（SESSDATA Cookie）进行身份验证。

## 优势
- ✅ **完全免费**：无需任何费用
- ✅ **中文优化**：针对中文视频优化识别效果
- ✅ **精确时间戳**：提供精确到毫秒的字幕时间轴
- ✅ **无额度限制**：只要您有 Bilibili 账号

## 如何获取 SESSDATA Cookie

### 步骤 1：登录 Bilibili
访问 [bilibili.com](https://www.bilibili.com) 并登录您的账号。

### 步骤 2：打开开发者工具
- **Windows/Linux**: 按 `F12`
- **Mac**: 按 `Cmd + Option + I`

### 步骤 3：找到 Cookie
1. 点击顶部的 **Application** 标签（有些浏览器显示为"应用程序"）
2. 左侧展开 **Cookies**
3. 点击 **https://www.bilibili.com**
4. 在右侧列表中找到 **SESSDATA**
5. 双击 **Value** 列的值进行复制

### 步骤 4：在应用中配置
1. 打开应用的 **设置** 页面
2. 在"语音转录引擎 (ASR)"部分选择 **Bilibili Bcut (Free/CN)**
3. 将复制的 SESSDATA 粘贴到输入框中
4. 点击保存

## 使用流程
1. 配置好 SESSDATA 后，前往 **导入** 页面
2. 粘贴 Bilibili 视频链接
3. 选择 **DeepSeek** 或其他 AI 进行智能分析
4. 等待处理完成

## 注意事项
- ⚠️ **Cookie 安全**：请勿将 SESSDATA 分享给他人
- ⚠️ **Cookie 有效期**：SESSDATA 通常有效期为几个月，过期后需重新获取
- 💡 **提示**：如果转录失败，请检查 Cookie 是否过期

## 常见问题

**Q: SESSDATA 会过期吗？**  
A: 会的，通常有效期为几个月。如果转录失败，请重新获取。

**Q: 使用 Bcut 是否安全？**  
A: 是的。SESSDATA 仅在您的浏览器和 Bilibili 服务器之间传递，应用不会存储或上传您的 Cookie。

**Q: 为什么需要登录？**  
A: Bilibili 的必剪 API 需要用户身份验证，以防止滥用和确保服务质量。

## 其他选择
如果您不想使用 Bilibili 账号，也可以选择其他 ASR 服务：
- **SiliconFlow**: 需要注册获取 API Key（免费或低价）
- **OpenAI**: 需要付费 API Key，识别质量高
- **Groq**: 需要免费 API Key，速度快
