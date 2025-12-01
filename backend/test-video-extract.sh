#!/bin/bash

# 测试视频提取 API

echo "🧪 测试 Bilibili 视频提取..."
echo ""

# 测试URL（包含中文标题，模拟真实情况）
TEST_URL="【未来金价或许会到一个离谱的数字！关键，看这三个信号！】 https://www.bilibili.com/video/BV1gisBzzELk/?share_source=copy_web&vd_source=c1df107d4ff1ef8a5ccb93c259703f6d"

echo "📝 测试URL:"
echo "$TEST_URL"
echo ""

# 替换为您的真实API Key
API_KEY="${GROQ_API_KEY:-your_groq_api_key_here}"
API_BASE="https://api.groq.com/openai/v1"

echo "🔑 使用 API Key: ${API_KEY:0:10}..."
echo ""

echo "📡 发送请求到后端..."
curl -X POST http://localhost:3000/api/video/extract \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$TEST_URL\", \"apiKey\": \"$API_KEY\", \"apiBaseUrl\": \"$API_BASE\"}" \
  | jq '.'

echo ""
echo "✅ 测试完成"
